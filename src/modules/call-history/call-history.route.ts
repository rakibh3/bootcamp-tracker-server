import express from 'express'

import {auth, validateRequest} from '@/middlewares'
import {CallHistoryControllers} from '@/modules/call-history/call-history.controller'
import {
  createCallHistoryValidationSchema,
  updateCallHistoryValidationSchema,
} from '@/modules/call-history/call-history.validation'
import {USER_ROLE} from '@/modules/user/user.constant'

const router = express.Router()

// Route to create a new call history
router.post(
  '/call-history',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.SRM),
  validateRequest(createCallHistoryValidationSchema),
  CallHistoryControllers.createCallHistory,
)

// Route to get all call history
router.get(
  '/call-history',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.SRM),
  CallHistoryControllers.getAllCallHistory,
)

// Route to get scheduled calls
router.get(
  '/call-history/scheduled',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.SRM),
  CallHistoryControllers.getScheduledCalls,
)

// Route to get today's calls
router.get(
  '/call-history/today',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.SRM),
  CallHistoryControllers.getTodayCalls,
)

// Route to get call history by ID
router.get(
  '/call-history/:callId',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.SRM),
  CallHistoryControllers.getCallHistoryById,
)

// Route to get call history by student
router.get(
  '/call-history/student/:studentId',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.SRM),
  CallHistoryControllers.getCallHistoryByStudent,
)

// Route to update call history
router.patch(
  '/call-history/:callId',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.SRM),
  validateRequest(updateCallHistoryValidationSchema),
  CallHistoryControllers.updateCallHistory,
)

// Route to delete call history
router.delete(
  '/call-history/:callId',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  CallHistoryControllers.deleteCallHistory,
)

export const CallHistoryRoute = router
