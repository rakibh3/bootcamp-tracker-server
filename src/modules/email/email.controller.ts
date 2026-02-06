import httpStatus from 'http-status'

import {EmailService} from '@/modules/email/email.service'
import {catchAsync, sendResponse} from '@/utils'

/**
 * Handles request to send an OTP verification email
 */
const sendOTP = catchAsync(async (req, res) => {
  const {email, otp} = req.body

  await EmailService.sendOTPEmail(email, otp)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP sent successfully',
    data: null,
  })
})

/**
 * Handles request to send a welcome email to new users
 */
const sendWelcomeEmail = catchAsync(async (req, res) => {
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Welcome email sent successfully',
    data: null,
  })
})

/**
 * Handles request to send reminder emails to students
 */
const sendReminderEmail = catchAsync(async (req, res) => {
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
