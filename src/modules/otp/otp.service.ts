import bcrypt from 'bcrypt'
import httpStatus from 'http-status'
import {JwtPayload} from 'jsonwebtoken'

import emailQueue from '@/config/queue.config'
import redisClient from '@/config/redis.config'
import {AppError} from '@/error'
import {IAuthResponse, IOTPData, IOTPRequest, IOTPVerify} from '@/modules/otp/otp.interface'
import {User} from '@/modules/user/user.model'
import {generateToken} from '@/utils'

import {generateOTP, getOTPRedisKey} from './otp.utils'

const OTP_EXPIRY_SECONDS = Number(process.env.OTP_EXPIRY_MINUTES || 5) * 60
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5)
const OTP_RESEND_COOLDOWN = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60)
const OTP_MAX_RESEND = Number(process.env.OTP_MAX_RESEND_ATTEMPTS || 3)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as string
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 8)

/**
 * Generates and sends a new OTP via email while enforcing
 * resend cooldowns and limits.
 */
const requestOTP = async (payload: IOTPRequest): Promise<{message: string}> => {
  const {email} = payload

  const user = await User.findOne({email}).lean()
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }
  const otpKey = getOTPRedisKey(email)

  const existingData = await redisClient.get(otpKey)

  if (existingData) {
    const otpData: IOTPData = JSON.parse(existingData as string)
    const now = Date.now()
    const timeSinceLastResend = (now - otpData.lastResendAt) / 1000

    if (timeSinceLastResend < OTP_RESEND_COOLDOWN) {
      const remainingTime = Math.ceil(OTP_RESEND_COOLDOWN - timeSinceLastResend)
      throw new AppError(
        httpStatus.TOO_MANY_REQUESTS,
        `Please wait ${remainingTime} seconds before requesting a new OTP`,
      )
    }

    if (otpData.resendCount >= OTP_MAX_RESEND) {
      throw new AppError(
        httpStatus.TOO_MANY_REQUESTS,
        'Maximum resend attempts reached. Please try again later.',
      )
    }
  }

  const otp = generateOTP()
  const hashedOTP = await bcrypt.hash(otp, BCRYPT_ROUNDS)

  const otpData: IOTPData = {
    hashedOTP,
    attempts: 0,
    resendCount: existingData ? JSON.parse(existingData as string).resendCount + 1 : 0,
    lastResendAt: Date.now(),
  }

  await redisClient.setex(otpKey, OTP_EXPIRY_SECONDS, JSON.stringify(otpData))

  try {
    await emailQueue.add(
      {email, otp},
      {
        priority: 1,
        attempts: 3,
        timeout: 30000,
      },
    )
  } catch (error) {
    await redisClient.del(otpKey)
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to queue OTP email. Please try again.',
    )
  }

  return {message: 'OTP sent successfully to your email'}
}

/**
 * Validates the provided OTP and returns an
 * access token upon successful verification.
 */
const verifyOTP = async (payload: IOTPVerify): Promise<IAuthResponse> => {
  const {email, otp} = payload
  if (!email || !otp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Email and OTP are required')
  }
  const registeredUser = await User.findOne({email}).lean()
  if (!registeredUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }
  const otpKey = getOTPRedisKey(email)
  const userCacheKey = `user:${email}`

  const otpDataString = await redisClient.get(otpKey)
  const cachedUser = await redisClient.get(userCacheKey)

  if (!otpDataString) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'OTP expired or not found. Please request a new one.',
    )
  }

  const otpData: IOTPData = JSON.parse(otpDataString as string)

  if (otpData.attempts >= OTP_MAX_ATTEMPTS) {
    await redisClient.del(otpKey)
    throw new AppError(
      httpStatus.TOO_MANY_REQUESTS,
      'Maximum verification attempts exceeded. Please request a new OTP.',
    )
  }

  const isOTPValid = await bcrypt.compare(otp, otpData.hashedOTP)

  if (!isOTPValid) {
    otpData.attempts += 1
    const ttl = await redisClient.ttl(otpKey)
    await redisClient.setex(otpKey, ttl > 0 ? ttl : OTP_EXPIRY_SECONDS, JSON.stringify(otpData))

    const remainingAttempts = OTP_MAX_ATTEMPTS - otpData.attempts
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid OTP. ${remainingAttempts} attempts remaining.`,
    )
  }

  await redisClient.del(otpKey)

  let user
  if (cachedUser) {
    user = JSON.parse(cachedUser as string)
  } else {
    user = await User.findOne({email}).lean()

    if (!user) {
      user = await User.create({email})
    }

    await redisClient.setex(userCacheKey, 3600, JSON.stringify(user))
  }

  const tokenPayload: JwtPayload = {
    _id: user._id.toString(),
    email: user.email,
    role: user.role || 'STUDENT',
  }

  const accessToken = generateToken(tokenPayload, JWT_SECRET, JWT_EXPIRES_IN)

  return {
    accessToken,
    user: {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role || 'STUDENT',
      discordUsername: user.discordUsername,
      phone: user.phone,
    },
  }
}

export const OTPService = {
  requestOTP,
  verifyOTP,
}
