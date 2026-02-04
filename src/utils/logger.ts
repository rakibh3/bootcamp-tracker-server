import fs from 'fs'
import path from 'path'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  meta?: unknown
}

const LOG_DIR = path.join(process.cwd(), 'logs')

// Ensure log directory exists
const ensureLogDirectory = () => {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }
}

const formatLogEntry = (entry: LogEntry): string => {
  const metaStr = entry.meta ? ` | ${JSON.stringify(entry.meta)}` : ''
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${metaStr}`
}

const writeToFile = (filename: string, content: string) => {
  ensureLogDirectory()
  const filePath = path.join(LOG_DIR, filename)
  fs.appendFileSync(filePath, content + '\n')
}

const getTimestamp = (): string => {
  return new Date().toISOString()
}

const log = (level: LogLevel, message: string, meta?: unknown) => {
  const entry: LogEntry = {
    timestamp: getTimestamp(),
    level,
    message,
    meta,
  }

  const formattedEntry = formatLogEntry(entry)

  // Console output with colors
  const colors = {
    info: '\x1b[36m', // Cyan
    warn: '\x1b[33m', // Yellow
    error: '\x1b[31m', // Red
    debug: '\x1b[35m', // Magenta
  }
  const reset = '\x1b[0m'

  console.log(`${colors[level]}${formattedEntry}${reset}`)

  // Write to file
  const today = new Date().toISOString().split('T')[0]
  writeToFile(`${today}.log`, formattedEntry)

  // Write errors to separate file
  if (level === 'error') {
    writeToFile(`${today}-error.log`, formattedEntry)
  }
}

export const logger = {
  info: (message: string, meta?: unknown) => log('info', message, meta),
  warn: (message: string, meta?: unknown) => log('warn', message, meta),
  error: (message: string, meta?: unknown) => log('error', message, meta),
  debug: (message: string, meta?: unknown) => log('debug', message, meta),
}

export default logger
