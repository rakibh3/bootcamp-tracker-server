import httpStatus from 'http-status'
import {catchAsync} from '@/utils/catchAsync'
import {sendResponse} from '@/utils/sendResponse'
import {OTPService} from '@/modules/otp/otp.service'

/**
 * Handles request to generate and send a new OTP to user email
 */
const requestOTP = catchAsync(async (req, res) => {
  const result = await OTPService.requestOTP(req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  })
})

/**
 * Handles request to verify an OTP and authenticate the user
 */
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
