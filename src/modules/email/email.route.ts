import express from 'express'

import {EmailControllers} from '@/modules/email/email.controller'
import auth from '@/middlewares/auth'

const router = express.Router()

// Route to send OTP email
router.post('/email/send-otp', EmailControllers.sendOTP)

// Route to send welcome email
router.post('/email/welcome', EmailControllers.sendWelcomeEmail)

// Route to send reminder email
router.post('/email/reminder', EmailControllers.sendReminderEmail)

// Route to send outreach email (single or bulk)
router.post(
  '/email/send-outreach',
  auth('ADMIN', 'SUPER_ADMIN', 'SRM'),
  EmailControllers.sendOutreachEmail,
)

export const EmailRoute = router
