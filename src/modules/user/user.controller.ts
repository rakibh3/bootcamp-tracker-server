import httpStatus from 'http-status'

import {USER_ROLE} from '@/modules/user/user.constant'
import {UserServices} from '@/modules/user/user.service'
import {catchAsync, sendResponse} from '@/utils'

/**
 * Handles request to register a new user in the system
 */
const createUser = catchAsync(async (req, res) => {
  const result = await UserServices.createUserIntoDatabase(req.body)

  let message = 'User registered successfully'
  if (result?.role === USER_ROLE.STUDENT) {
    message = 'Student registered successfully'
  } else if (result?.role === USER_ROLE.ADMIN) {
    message = 'Admin registered successfully'
  }

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message,
    data: result,
  })
})

/**
 * Handles request to fetch all registered users
 */
const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsersFromDatabase()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users fetched successfully',
    data: result,
  })
})

/**
 * Handles request to update the administrative role of a user
 */
const updateUserRole = catchAsync(async (req, res) => {
  const {userId} = req.params
  const {role} = req.body

  const result = await UserServices.updateUserRoleInDatabase(userId as string, role)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User role updated successfully',
    data: result,
  })
})

/**
 * Handles request to permanently delete a user and their data
 */
const deleteUser = catchAsync(async (req, res) => {
  const {userId} = req.params

  const result = await UserServices.deleteUserFromDatabase(userId as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  })
})

/**
 * Handles request to fetch all users with the SRM role
 */
const getSRMs = catchAsync(async (req, res) => {
  const result = await UserServices.getSRMsFromDatabase()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'SRMs fetched successfully',
    data: result,
  })
})

/**
 * Handles request to update an SRM's SMTP email configuration
 */
const updateSmtpConfig = catchAsync(async (req, res) => {
  const userId = req.user._id
  const {smtpConfig} = req.body

  const result = await UserServices.updateSmtpConfigInDatabase(userId, smtpConfig)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'SMTP config updated successfully',
    data: result,
  })
})

export const UserControllers = {
  createUser,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSRMs,
  updateSmtpConfig,
}
