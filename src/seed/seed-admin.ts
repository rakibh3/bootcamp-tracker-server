import mongoose from 'mongoose'

import config from '@/config'
import {User} from '@/modules/user/user.model'
import logger from '@/utils/logger'

const seedAdmin = async () => {
  try {
    await mongoose.connect(config.database_url as string)
    logger.info('Connected to database')

    const adminData = {
      name: 'Admin User',
      email: 'admin@bootcamp-tracker.com',
      phone: '+8801700000001',
      role: 'ADMIN' as const,
    }

    const existingAdmin = await User.findOne({email: adminData.email})

    if (existingAdmin) {
      logger.info('Admin user already exists')
      return
    }

    const admin = await User.create(adminData)
    logger.info('Admin user created successfully:', {email: admin.email})
  } catch (error) {
    logger.error('Error seeding admin:', error)
  } finally {
    await mongoose.disconnect()
    logger.info('Disconnected from database')
  }
}

// Run if called directly
if (require.main === module) {
  seedAdmin()
}

export default seedAdmin
