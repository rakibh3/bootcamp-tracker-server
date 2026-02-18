import redisClient from '@/config/redis.config'
import logger from '@/utils/logger'

/**
 * Get cached data from Redis
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await redisClient.get(key)
    if (cached) {
      return JSON.parse(cached) as T
    }
    return null
  } catch (error) {
    logger.error(`Redis getCache error for key ${key}:`, error)
    return null
  }
}

/**
 * Set data in Redis with TTL (seconds)
 */
export const setCache = async (key: string, data: unknown, ttlSeconds: number): Promise<void> => {
  try {
    await redisClient.setex(key, ttlSeconds, JSON.stringify(data))
  } catch (error) {
    logger.error(`Redis setCache error for key ${key}:`, error)
  }
}

/**
 * Invalidate cache keys matching a pattern (e.g. 'cache:task:*')
 */
export const invalidateCache = async (...patterns: string[]): Promise<void> => {
  try {
    for (const pattern of patterns) {
      const keys = await redisClient.keys(pattern)
      if (keys.length > 0) {
        await redisClient.del(...keys)
        logger.info(`Invalidated ${keys.length} cache keys matching: ${pattern}`)
      }
    }
  } catch (error) {
    logger.error('Redis invalidateCache error:', error)
  }
}
