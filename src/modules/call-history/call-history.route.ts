import express from 'express'
import { validateRequest } from '@/middlewares/validateRequest'
import {
  createCallHistoryValidationSchema,
  updateCallHistoryValidationSchema,
} from './call-history.validation'
import { CallHistoryControllers } from './call-history.controller'

const router = express.Router()

// Route to create a new call history
router.post(
  '/call-history',
  validateRequest(createCallHistoryValidationSchema),
  CallHistoryControllers.createCallHistory,
)

// Route to get all call history
router.get('/call-history', CallHistoryControllers.getAllCallHistory)

// Route to get scheduled calls
router.get('/call-history/scheduled', CallHistoryControllers.getScheduledCalls)

// Route to get today's calls
router.get('/call-history/today', CallHistoryControllers.getTodayCalls)

// Route to get call history by ID
router.get('/call-history/:callId', CallHistoryControllers.getCallHistoryById)

// Route to get call history by student
router.get('/call-history/student/:studentId', CallHistoryControllers.getCallHistoryByStudent)

// Route to update call history
router.patch(
  '/call-history/:callId',
  validateRequest(updateCallHistoryValidationSchema),
  CallHistoryControllers.updateCallHistory,
)

// Route to delete call history
router.delete('/call-history/:callId', CallHistoryControllers.deleteCallHistory)

export const CallHistoryRoute = router
