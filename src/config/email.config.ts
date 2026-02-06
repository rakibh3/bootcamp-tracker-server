import nodemailer, {Transporter} from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const emailTransporter: Transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

emailTransporter.verify((error) => {
  if (error) {
    console.error('❌ Email transporter error:', error)
  } else {
    console.log('✅ Email transporter ready')
  }
})

export default emailTransporter
