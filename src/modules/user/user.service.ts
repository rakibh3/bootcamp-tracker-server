import httpStatus from 'http-status'
import AppError from '@/error/AppError'
import { Attendance } from '../attendance/attendance.model'
import { TUser } from './user.interface'
import { User } from './user.model'

// Create a new user in the database
const createUserIntoDatabase = async (payload: TUser) => {
  const result = await User.create(payload)
  return result
}

// Get all users from the database
const getAllUsersFromDatabase = async () => {
  const result = await User.find()
  return result
}

// Update user role in the database
const updateUserRoleInDatabase = async (userId: string, role: string) => {
  const result = await User.findByIdAndUpdate(
    { _id: userId },
    { role },
    { new: true, runValidators: true },
  )
  return result
}

// Delete user from the database
const deleteUserFromDatabase = async (userId: string) => {
  const user = await User.findById(userId)

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  // Delete related attendance records from Attendance collection
  await Attendance.deleteMany({ studentId: userId })

  // Delete the user
  const result = await User.findByIdAndDelete(userId)
  return result
}

// Get all SRMs from the database
const getSRMsFromDatabase = async () => {
  const result = await User.find({ role: 'SRM' })
  return result
}

// Update SMTP config in the database
const updateSmtpConfigInDatabase = async (userId: string, smtpConfig: { appPassword: string }) => {
  const result = await User.findByIdAndUpdate(
    userId,
    { smtpConfig },
    { new: true, runValidators: true },
  )
  return result
}

export const UserServices = {
  createUserIntoDatabase,
  getAllUsersFromDatabase,
  updateUserRoleInDatabase,
  deleteUserFromDatabase,
  getSRMsFromDatabase,
  updateSmtpConfigInDatabase,
}
