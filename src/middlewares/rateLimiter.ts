import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import redisClient from '@/config/redis.config'

// Global rate limiter - 100 requests per minute per IP
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-ignore - ioredis uses sendCommand
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'rl:global:',
  }),
})

// OTP request limiter - 5 OTP requests per 5 minutes per IP
export const otpRequestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: 'Too many OTP requests. Please try again after 5 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  store: new RedisStore({
    // @ts-ignore - ioredis uses sendCommand
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'rl:otp:request:',
  }),
})

// OTP verify limiter - 10 verification attempts per 5 minutes per IP
export const otpVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: 'Too many verification attempts. Please try again after 5 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  store: new RedisStore({
    // @ts-ignore - ioredis uses sendCommand
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'rl:otp:verify:',
  }),
})

// Auth endpoints limiter - 20 requests per minute per IP
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: 'Too many authentication requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-ignore - ioredis uses sendCommand
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'rl:auth:',
  }),
})
