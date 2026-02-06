import path from 'path'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const {combine, timestamp, printf, colorize, errors} = winston.format

/**
 * Log directory path where all log files will be stored.
 * The logs folder is located at the project root.
 */
const LOG_DIR = path.join(process.cwd(), 'logs')

/**
 * Custom log format for the console output.
 * Focuses on readability with timestamp, level, and message/stack trace.
 */
const consoleFormat = printf(({level, message, timestamp, stack}) => {
  const logMessage = stack ? `\n${stack}` : message
  return `${timestamp} [${level}]: ${logMessage}\n`
})

/**
 * Custom log format for file storage.
 * Uses JSON format to facilitate machine processing and log analysis tools.
 * Includes timestamps and full error stacks.
 */
const fileFormat = combine(
  timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
  errors({stack: true}),
  winston.format.json(),
)

/**
 * Core Winston Logger Instance.
 * 
 * Configuration features:
 * 1. Log Level: 'debug' in development, 'info' in production.
 * 2. Transports:
 *    - DailyRotateFile (Application): Stores general info logs, rotated daily, kept for 1 week.
 *    - DailyRotateFile (Error): Specifically captures error level logs for easier troubleshooting.
 */
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: fileFormat,
  transports: [
    // General application logs - Rotated daily, archived after 5MB, retained for 1 week.
    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '5m',
      maxFiles: '7d',
      level: 'info',
    }),
    // Dedicated error logs - Makes it easy to find production issues at a glance.
    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '5m',
      maxFiles: '7d',
      level: 'error',
    }),
  ],
})

/**
 * Console Logging Configuration.
 * 
 * Enabled only in non-production environments.
 * Adds color-coding and simplified timestamps for local development debugging.
 */
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize({all: true}),
        timestamp({format: 'HH:mm:ss'}),
        errors({stack: true}),
        consoleFormat,
      ),
    }),
  )
}

export default logger
