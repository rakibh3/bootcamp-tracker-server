import {z} from 'zod'

const requestOTPSchema = z.object({
  email: z
    .string({
      message: 'Email is required',
    })
    .email({
      message: 'Invalid email format',
    }),
})

const verifyOTPSchema = z.object({
  email: z
    .string({
      message: 'Email is required',
    })
    .email({
      message: 'Invalid email format',
    }),
  otp: z
    .string({
      message: 'OTP is required',
    })
    .length(6, {
      message: 'OTP must be 6 digits',
    })
    .regex(/^\d{6}$/, {
      message: 'OTP must contain only digits',
    }),
})

export const OTPValidation = {
  requestOTPSchema,
  verifyOTPSchema,
}
