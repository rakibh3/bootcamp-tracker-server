import express from 'express'
import { validateRequest } from '@/middlewares/validateRequest'
import {
  userRoleUpdateValidationSchema,
  userValidationSchema,
} from './user.validation'
import { UserControllers } from './user.controller'
import auth from '@/middlewares/auth'
import { USER_ROLE } from './user.constant'

const router = express.Router()

// Route to create a new user
router.post(
  '/auth/register',
  // auth(USER_ROLE.ADMIN),
  validateRequest(userValidationSchema),
  UserControllers.createUser,
)

// Route to get all users
router.get('/users',
  // auth(USER_ROLE.ADMIN),
 UserControllers.getAllUsers)

// Route to update user role
router.patch(
  '/user/:userId',
  // auth(USER_ROLE.ADMIN),
  validateRequest(userRoleUpdateValidationSchema),
  UserControllers.updateUserRole,
)

// Route to delete user
router.delete(
  '/user/:userId',
  // auth(USER_ROLE.ADMIN),
  UserControllers.deleteUser,
)

export const UserRoute = router
