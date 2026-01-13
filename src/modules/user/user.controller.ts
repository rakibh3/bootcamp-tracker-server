import httpStatus from 'http-status'
import { catchAsync } from '@/utils/catchAsync'
import { sendResponse } from '@/utils/sendResponse'
import { UserServices } from './user.service'
import { USER_ROLE } from './user.constant'

// Create a new user
const createUser = catchAsync(async (req, res) => {
  const { ...payload } = req.body

  const result = await UserServices.createUserIntoDatabase(payload)

  let message
  if (result?.role === USER_ROLE.STUDENT) {
    message = 'Student registered successfully'
  } else if(result?.role === USER_ROLE.ADMIN) {
    message = 'Admin registered successfully'
  } 

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message,
    data: result,
  })
})

// Get all users
const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsersFromDatabase()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users fetched successfully',
    data: result,
  })
})

// Update user role
const updateUserRole = catchAsync(async (req, res) => {
  const { userId } = req.params 
  const { role } = req.body

  const result = await UserServices.updateUserRoleInDatabase(userId, role)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User role updated successfully',
    data: result,
  })
})

export const UserControllers = {
  createUser,
  getAllUsers,
  updateUserRole,
}
