import mongoose from 'mongoose'

import config from '@/config'
import {User} from '@/modules/user/user.model'
import logger from '@/utils/logger'

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(config.database_url as string)
    logger.info('Connected to database')

    const superAdminData = {
      name: 'Super Admin',
      email: 'superadmin@bootcamp-tracker.com',
      phone: '+8801700000000',
      role: 'SUPER_ADMIN' as const,
    }

    const existingSuperAdmin = await User.findOne({email: superAdminData.email})

    if (existingSuperAdmin) {
      logger.info('Super Admin user already exists')
      return
    }

    const superAdmin = await User.create(superAdminData)
    logger.info('Super Admin user created successfully:', {email: superAdmin.email})
  } catch (error) {
    logger.error('Error seeding super admin:', error)
  } finally {
    await mongoose.disconnect()
    logger.info('Disconnected from database')
  }
}

// Run if called directly
if (require.main === module) {
  seedSuperAdmin()
}

export default seedSuperAdmin
