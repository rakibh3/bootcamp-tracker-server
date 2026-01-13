import Redis from 'ioredis'
import dotenv from 'dotenv'

dotenv.config()

// Optimized Redis configuration for high throughput
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  
  // Connection pool settings for high concurrency
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  
  // Performance optimizations
  lazyConnect: false,
  keepAlive: 30000,
  connectTimeout: 10000,
  
  // Retry strategy with exponential backoff
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  
  // Reconnect on error
  reconnectOnError: (err) => {
    const targetError = 'READONLY'
    if (err.message.includes(targetError)) {
      return true
    }
    return false
  },
})

// Connection event handlers
redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully')
})

redisClient.on('ready', () => {
  console.log('✅ Redis ready for commands')
})

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err)
})

redisClient.on('close', () => {
  console.log('⚠️  Redis connection closed')
})

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...')
})

export default redisClient
