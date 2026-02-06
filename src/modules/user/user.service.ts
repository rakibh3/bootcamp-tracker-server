import httpStatus from 'http-status'
import AppError from '@/error/AppError'
import {Attendance} from '@/modules/attendance/attendance.model'
import {TUser} from '@/modules/user/user.interface'
import {User} from '@/modules/user/user.model'

/**
 * Creates a new user record in the database
 */
const createUserIntoDatabase = async (payload: TUser) => {
  const result = await User.create(payload)
  return result
}

/**
 * Retrieves all users from the database
 */
const getAllUsersFromDatabase = async () => {
  const result = await User.find()
  return result
}

/**
 * Updates the administrative role of a specific user
 */
const updateUserRoleInDatabase = async (userId: string, role: string) => {
  const result = await User.findByIdAndUpdate(
    {_id: userId},
    {role},
    {new: true, runValidators: true},
  )
  return result
}

/**
 * Deletes a user and all their associated attendance records
 */
const deleteUserFromDatabase = async (userId: string) => {
  const user = await User.findById(userId)

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  await Attendance.deleteMany({studentId: userId})

  const result = await User.findByIdAndDelete(userId)
  return result
}

/**
 * Retrieves all users with the SRM (Student Relationship Manager) role
 */
const getSRMsFromDatabase = async () => {
  const result = await User.find({role: 'SRM'})
  return result
}

/**
 * Updates the SMTP configuration for an SRM user
 */
const updateSmtpConfigInDatabase = async (userId: string, smtpConfig: {appPassword: string}) => {
  const result = await User.findByIdAndUpdate(
    userId,
    {smtpConfig},
    {new: true, runValidators: true},
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
