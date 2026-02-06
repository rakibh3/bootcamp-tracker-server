import express from 'express'
import {EmailControllers} from './email.controller'

const router = express.Router()

// Route to send OTP email
router.post('/email/send-otp', EmailControllers.sendOTP)

// Route to send welcome email
router.post('/email/welcome', EmailControllers.sendWelcomeEmail)

// Route to send reminder email
router.post('/email/reminder', EmailControllers.sendReminderEmail)

export const EmailRoute = router
