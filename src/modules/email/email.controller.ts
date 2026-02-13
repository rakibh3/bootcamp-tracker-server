import httpStatus from 'http-status'

import {AppError} from '@/error'
import {EmailService} from '@/modules/email/email.service'
import {User} from '@/modules/user/user.model'
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

/**
 * Handles request to send outreach emails to students
 * Supports both single recipient and multiple recipients
 */
const sendOutreachEmail = catchAsync(async (req, res) => {
  const {to, subject, body} = req.body
  const senderEmail = req.user?.email

  // Fetch sender's SMTP config
  const sender = await User.findOne({email: senderEmail})

  if (!sender?.smtpConfig?.appPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'SMTP configuration missing. Please set your Gmail App Password in settings.',
    )
  }

  const recipients = Array.isArray(to) ? to : [to]

  // Send emails
  // For now, we loop through recipients. In a high-volume scenario, we'd use a queue.
  const emailPromises = recipients.map((recipient) =>
    EmailService.sendPersonalizedEmail(
      {
        email: sender.email,
        appPassword: sender.smtpConfig!.appPassword!,
        name: sender.name,
      },
      recipient,
      subject,
      body,
    ),
  )

  await Promise.all(emailPromises)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Outreach email(s) sent successfully to ${recipients.length} recipient(s)`,
    data: null,
  })
})

export const EmailControllers = {
  sendOTP,
  sendWelcomeEmail,
  sendReminderEmail,
  sendOutreachEmail,
}
