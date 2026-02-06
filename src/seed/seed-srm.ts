import mongoose from 'mongoose'

import config from '@/config'
import {User} from '@/modules/user/user.model'
import logger from '@/utils/logger'

// SRM = Student Relationship Manager
const seedSRM = async () => {
  try {
    await mongoose.connect(config.database_url as string)
    logger.info('Connected to database')

    const srmUsers = [
      {
        name: 'SRM User 1',
        email: 'srm1@bootcamp-tracker.com',
        phone: '+8801700000002',
        role: 'ADMIN' as const,
      },
      {
        name: 'SRM User 2',
        email: 'srm2@bootcamp-tracker.com',
        phone: '+8801700000003',
        role: 'ADMIN' as const,
      },
      {
        name: 'SRM User 3',
        email: 'srm3@bootcamp-tracker.com',
        phone: '+8801700000004',
        role: 'ADMIN' as const,
      },
    ]

    for (const srmData of srmUsers) {
      const existingSRM = await User.findOne({email: srmData.email})

      if (existingSRM) {
        logger.info(`SRM user ${srmData.email} already exists`)
        continue
      }

      const srm = await User.create(srmData)
      logger.info('SRM user created successfully:', {email: srm.email})
    }

    logger.info('SRM seeding completed')
  } catch (error) {
    logger.error('Error seeding SRM users:', error)
  } finally {
    await mongoose.disconnect()
    logger.info('Disconnected from database')
  }
}

// Run if called directly
if (require.main === module) {
  seedSRM()
}

export default seedSRM
