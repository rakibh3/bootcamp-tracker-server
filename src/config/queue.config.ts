import Queue from 'bull'

import {EmailService} from '@/modules/email/email.service'
import logger from '@/utils/logger'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
const parsedRedisUrl = new URL(redisUrl)
const redisDb = parsedRedisUrl.pathname ? Number(parsedRedisUrl.pathname.slice(1)) : undefined
const redisUsername = parsedRedisUrl.username || undefined
const redisPassword = parsedRedisUrl.password || undefined
const isTls = parsedRedisUrl.protocol === 'rediss:'

// Create email queue with Redis
const emailQueue = new Queue('email-queue', {
  redis: {
    host: parsedRedisUrl.hostname,
    port: Number(parsedRedisUrl.port) || 6379,
    username: redisUsername,
    password: redisPassword,
    db: Number.isNaN(redisDb) ? undefined : redisDb,
    tls: isTls ? {} : undefined,
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
  logger.info(`Email sent to ${result.email}`)
})

emailQueue.on('failed', (job, err) => {
  logger.error(`Email failed for ${job?.data?.email}:`, err)
})

emailQueue.on('error', (error) => {
  logger.error('Queue error:', error)
})

export default emailQueue
