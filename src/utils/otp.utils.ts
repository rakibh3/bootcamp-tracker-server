import crypto from 'crypto'

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString()
}

export const getOTPRedisKey = (email: string): string => {
  return `otp:${email.toLowerCase()}`
}

export const getOTPRateLimitKey = (email: string): string => {
  return `otp_rate_limit:${email.toLowerCase()}`
}
