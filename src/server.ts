import mongoose from 'mongoose'

import app from '@/app'
import config from '@/config'
import logger from '@/utils/logger'

// Establish database connection
const startServer = async () => {
  try {
    await mongoose.connect(config.database_url as string)
    logger.info('Connected to MongoDB successfully')

    // Start Express server (only in non-serverless environments)
    if (process.env.VERCEL !== '1') {
      app.listen(config.port, () => {
        logger.info(`Server running on port: ${config.port}`)
      })
    }
  } catch (error) {
    // Log if unable to connect to database
    logger.error('Error starting server:', error)
  }
}

// Initialize database connection
startServer()

// Export for Vercel serverless
export default app
