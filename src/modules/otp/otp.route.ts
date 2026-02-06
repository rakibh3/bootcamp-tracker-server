import { Router } from 'express'
import { OTPControllers } from './otp.controller'
import { OTPValidation } from './otp.validation'
import { validateRequest } from '@/middlewares/validateRequest'
import { otpRequestLimiter, otpVerifyLimiter } from '@/middlewares/rateLimiter'

const router = Router()

router.post(
  '/auth/request-otp',
  otpRequestLimiter,
  validateRequest(OTPValidation.requestOTPSchema),
  OTPControllers.requestOTP,
)

router.post(
  '/auth/verify-otp',
  otpVerifyLimiter,
  validateRequest(OTPValidation.verifyOTPSchema),
  OTPControllers.verifyOTP,
)

export const OTPRoute = router
