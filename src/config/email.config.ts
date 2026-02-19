import dotenv from 'dotenv'
import nodemailer, {Transporter} from 'nodemailer'

import logger from '@/utils/logger'

dotenv.config()

const isGmail = process.env.SMTP_HOST === 'smtp.gmail.com'

const emailTransporter: Transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // Use env var instead of hardcoded false
  service: isGmail ? 'gmail' : undefined, // Explicit service helps on some cloud providers
  pool: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

emailTransporter.verify((error: Error | null) => {
  if (error) {
    logger.error('Email transporter error:', error)
  } else {
    logger.info('Email transporter ready')
  }
})

export default emailTransporter
