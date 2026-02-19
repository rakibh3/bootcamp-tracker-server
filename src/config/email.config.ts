import dotenv from 'dotenv'
import nodemailer, {Transporter} from 'nodemailer'

import logger from '@/utils/logger'

dotenv.config()

const emailTransporter: Transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
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
