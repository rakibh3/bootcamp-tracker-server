import httpStatus from 'http-status'
import { catchAsync } from '@/utils/catchAsync'
import { sendResponse } from '@/utils/sendResponse'
import { OTPService } from './otp.service'

const requestOTP = catchAsync(async (req, res) => {
  const result = await OTPService.requestOTP(req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  })
})

const verifyOTP = catchAsync(async (req, res) => {
  const result = await OTPService.verifyOTP(req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP verified successfully',
    data: result,
  })
})

export const OTPControllers = {
  requestOTP,
  verifyOTP,
}
