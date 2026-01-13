/* eslint-disable no-console */
import mongoose from 'mongoose'

import app from '@/app'
import config from '@/config'

// Establish database connection
const startServer = async () => {
  try {
    await mongoose.connect(config.database_url as string)

    // Start Express server
    app.listen(config.port, () => {
      console.log(`Server running on port: ${config.port}`)
    })
  } catch (error) {
    // Log if unable to connect to database
    console.error('Error starting server:', error)
  }
}

startServer()
