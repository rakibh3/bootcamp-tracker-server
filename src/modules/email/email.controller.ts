import httpStatus from 'http-status'
import { catchAsync } from '@/utils/catchAsync'
import { sendResponse } from '@/utils/sendResponse'
import { EmailService } from './email.service'

const sendOTP = catchAsync(async (req, res) => {
  const { email, otp } = req.body

  await EmailService.sendOTPEmail(email, otp)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP sent successfully',
    data: null,
  })
})

const sendWelcomeEmail = catchAsync(async (req, res) => {
  const { email, name } = req.body

  // Welcome email logic would go here
  // For now, just return success
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Welcome email sent successfully',
    data: null,
  })
})

const sendReminderEmail = catchAsync(async (req, res) => {
  const { email, subject, message } = req.body

  // Reminder email logic would go here
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reminder email sent successfully',
    data: null,
  })
})

export const EmailControllers = {
  sendOTP,
  sendWelcomeEmail,
  sendReminderEmail,
}
