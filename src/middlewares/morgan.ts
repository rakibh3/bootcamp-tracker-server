import morgan, {StreamOptions} from 'morgan'

import logger from '@/utils/logger'

/**
 * Stream configuration for Morgan.
 * This directs Morgan's HTTP request logs into our Winston logger instance.
 * We trim the message to remove trailing newlines added by Morgan.
 */
const stream: StreamOptions = {
  write: (message) => logger.info(message.trim()),
}

/**
 * Skip logic for the logger.
 * We disable HTTP request logging during automated tests to keep the
 * test output clean and focused.
 */
const skip = () => {
  const env = process.env.NODE_ENV || 'development'
  return env === 'test'
}

/**
 * Morgan Middleware Configuration.
 *
 * Uses a concise custom format that captures:
 * - HTTP Method (GET, POST, etc.)
 * - Request URL
 * - HTTP Status Code
 * - Response Time in milliseconds
 * - Response Content Length
 */
const morganMiddleware = morgan(':method :url :status :response-time ms - :res[content-length]', {
  stream,
  skip,
})

export default morganMiddleware
