import nodemailer from 'nodemailer'
import emailTransporter from '@/config/email.config'

const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@bootcamp-tracker.com',
    to: email,
    subject: 'Your OTP Code - Bootcamp Tracker',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .warning { color: #e74c3c; font-size: 14px; margin-top: 20px; }
          .footer { text-align: center; color: #777; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 OTP Verification</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You requested an OTP to verify your email address. Use the code below to complete your authentication:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            
            <p><strong>This code will expire in 5 minutes.</strong></p>
            
            <div class="warning">
              ⚠️ If you didn't request this code, please ignore this email.
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Bootcamp Tracker. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Your OTP code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this email.`,
  }

  await emailTransporter.sendMail(mailOptions)
}

export const EmailService = {
  sendOTPEmail,
  sendPersonalizedEmail: async (
    senderConfig: { email: string; appPassword: string; name?: string },
    to: string,
    subject: string,
    html: string,
  ): Promise<void> => {
    // Create a temporary transporter for this specific sender
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: senderConfig.email,
        pass: senderConfig.appPassword,
      },
    })

    const mailOptions = {
      from: senderConfig.name
        ? `"${senderConfig.name}" <${senderConfig.email}>`
        : senderConfig.email,
      to,
      subject,
      html,
    }

    await transporter.sendMail(mailOptions)
  },
}
