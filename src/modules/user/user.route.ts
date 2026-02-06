import express from 'express'

import {auth, validateRequest} from '@/middlewares'
import {USER_ROLE} from '@/modules/user/user.constant'
import {UserControllers} from '@/modules/user/user.controller'
import {userRoleUpdateValidationSchema, userValidationSchema} from '@/modules/user/user.validation'

const router = express.Router()

// Route to create a new user
router.post(
  '/auth/register',
  // auth(USER_ROLE.ADMIN),
  validateRequest(userValidationSchema),
  UserControllers.createUser,
)

// Route to get all users
router.get('/users', auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN), UserControllers.getAllUsers)

// Route to update user role
router.patch(
  '/user/:userId',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  validateRequest(userRoleUpdateValidationSchema),
  UserControllers.updateUserRole,
)

// Route to get all SRMs
router.get('/users/srm', auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN), UserControllers.getSRMs)

// Route to update SMTP config
router.patch(
  '/users/smtp-config',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  UserControllers.updateSmtpConfig,
)

// Route to delete user
router.delete(
  '/user/:userId',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  UserControllers.deleteUser,
)

export const UserRoute = router
