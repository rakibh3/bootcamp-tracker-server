import mongoose from 'mongoose'

import app from '@/app'
import config from '@/config'
import logger from '@/utils/logger'

// Establish database connection
const startServer = async () => {
  try {
    await mongoose.connect(config.database_url as string)
    logger.info('Connected to MongoDB successfully')

    // Start Express server
    app.listen(config.port, () => {
      logger.info(`Server running on port: ${config.port}`)
    })
  } catch (error) {
    // Log if unable to connect to database
    logger.error('Error starting server:', error)
  }
}

startServer()
