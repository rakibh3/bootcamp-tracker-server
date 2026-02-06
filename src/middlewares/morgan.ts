import {NextFunction, Request, Response} from 'express'

import logger from '@/utils/logger'

interface RequestLog {
  method: string
  url: string
  status: number
  responseTime: string
  ip: string
  userAgent: string
}

const morganMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()

  // Capture the original end method
  const originalEnd = res.end

  // Override res.end to log after response is sent
  res.end = function (chunk?: unknown, encoding?: unknown, callback?: unknown) {
    const responseTime = Date.now() - startTime

    const logData: RequestLog = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
    }

    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error('Request failed', logData)
    } else if (res.statusCode >= 400) {
      logger.warn('Request error', logData)
    } else {
      logger.info('Request completed', logData)
    }

    // Call the original end method
    return originalEnd.call(this, chunk, encoding as BufferEncoding, callback as () => void)
  }

  next()
}

export default morganMiddleware
