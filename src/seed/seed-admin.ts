import mongoose from 'mongoose'
import { User } from '../modules/user/user.model'
import config from '../config'

const seedAdmin = async () => {
  try {
    await mongoose.connect(config.database_url as string)
    console.log('Connected to database')

    const adminData = {
      name: 'Admin User',
      email: 'admin@bootcamp-tracker.com',
      phone: '+8801700000001',
      role: 'ADMIN' as const,
    }

    const existingAdmin = await User.findOne({ email: adminData.email })

    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    const admin = await User.create(adminData)
    console.log('Admin user created successfully:', admin)
  } catch (error) {
    console.error('Error seeding admin:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from database')
  }
}

// Run if called directly
if (require.main === module) {
  seedAdmin()
}

export default seedAdmin
