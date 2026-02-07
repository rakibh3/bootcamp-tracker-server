import {Router} from 'express'

import {validateRequest} from '@/middlewares'

import {DevControllers} from './dev.controller'
import {DevValidation} from './dev.validation'

const router = Router()

/**
 * Feature flag endpoint for development testing
 * Allows logging in as any role without OTP
 */
router.post(
  '/login-as',
  validateRequest(DevValidation.loginAsRoleSchema),
  DevControllers.loginAsRole,
)

export const DevRoute = router
