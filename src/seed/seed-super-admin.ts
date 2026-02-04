import mongoose from 'mongoose'
import { User } from '../modules/user/user.model'
import config from '../config'

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(config.database_url as string)
    console.log('Connected to database')

    const superAdminData = {
      name: 'Super Admin',
      email: 'superadmin@bootcamp-tracker.com',
      phone: '+8801700000000',
      role: 'SUPER_ADMIN' as const,
    }

    const existingSuperAdmin = await User.findOne({ email: superAdminData.email })

    if (existingSuperAdmin) {
      console.log('Super Admin user already exists')
      return
    }

    const superAdmin = await User.create(superAdminData)
    console.log('Super Admin user created successfully:', superAdmin)
  } catch (error) {
    console.error('Error seeding super admin:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from database')
  }
}

// Run if called directly
if (require.main === module) {
  seedSuperAdmin()
}

export default seedSuperAdmin
