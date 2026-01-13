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

export const UserServices = {
  createUserIntoDatabase,
  getAllUsersFromDatabase,
  updateUserRoleInDatabase,
}
