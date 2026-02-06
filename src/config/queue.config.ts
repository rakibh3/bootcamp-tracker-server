import Queue from 'bull'
import redisClient from './redis.config'
import {EmailService} from '@/modules/email/email.service'

// Create email queue with Redis
const emailQueue = new Queue('email-queue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
})

// Process email jobs
emailQueue.process(10, async (job) => {
  const {email, otp} = job.data
  await EmailService.sendOTPEmail(email, otp)
  return {sent: true, email}
})

// Event handlers
emailQueue.on('completed', (job, result) => {
  console.log(`✅ Email sent to ${result.email}`)
})

emailQueue.on('failed', (job, err) => {
  console.error(`❌ Email failed for ${job?.data?.email}:`, err.message)
})

emailQueue.on('error', (error) => {
  console.error('❌ Queue error:', error)
})

export default emailQueue
