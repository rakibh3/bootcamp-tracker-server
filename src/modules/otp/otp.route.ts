import {Router} from 'express'

import {otpRequestLimiter, otpVerifyLimiter, validateRequest} from '@/middlewares'
import {OTPControllers} from '@/modules/otp/otp.controller'
import {OTPValidation} from '@/modules/otp/otp.validation'

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
