import mongoose from 'mongoose'
import { User } from '../modules/user/user.model'
import config from '../config'

// SRM = Student Relationship Manager
const seedSRM = async () => {
  try {
    await mongoose.connect(config.database_url as string)
    console.log('Connected to database')

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
      const existingSRM = await User.findOne({ email: srmData.email })

      if (existingSRM) {
        console.log(`SRM user ${srmData.email} already exists`)
        continue
      }

      const srm = await User.create(srmData)
      console.log('SRM user created successfully:', srm.email)
    }

    console.log('SRM seeding completed')
  } catch (error) {
    console.error('Error seeding SRM users:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from database')
  }
}

// Run if called directly
if (require.main === module) {
  seedSRM()
}

export default seedSRM
