import httpStatus from 'http-status'

import {CallHistoryServices} from '@/modules/call-history/call-history.service'
import {catchAsync, sendResponse} from '@/utils'

/**
 * Handles request to log a new call interaction
 */
const createCallHistory = catchAsync(async (req, res) => {
  const result = await CallHistoryServices.createCallHistoryIntoDatabase(req.body)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Call history created successfully',
    data: result,
  })
})

/**
 * Handles request to fetch all call history logs with pagination
 */
const getAllCallHistory = catchAsync(async (req, res) => {
  const {result, meta} = await CallHistoryServices.getAllCallHistoryFromDatabase(req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Call history fetched successfully',
    data: {calls: result, meta},
  })
})

/**
 * Handles request to fetch a specific call history log by ID
 */
const getCallHistoryById = catchAsync(async (req, res) => {
  const {callId} = req.params
  const result = await CallHistoryServices.getCallHistoryByIdFromDatabase(callId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Call history fetched successfully',
    data: result,
  })
})

/**
 * Handles request to fetch all call interactions for a specific student
 */
const getCallHistoryByStudent = catchAsync(async (req, res) => {
  const {studentId} = req.params
  const result = await CallHistoryServices.getCallHistoryByStudentFromDatabase(studentId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Call history fetched successfully',
    data: result,
  })
})

/**
 * Handles request to update an existing call history log
 */
const updateCallHistory = catchAsync(async (req, res) => {
  const {callId} = req.params
  const result = await CallHistoryServices.updateCallHistoryInDatabase(callId, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Call history updated successfully',
    data: result,
  })
})

/**
 * Handles request to delete a call history log
 */
const deleteCallHistory = catchAsync(async (req, res) => {
  const {callId} = req.params
  const result = await CallHistoryServices.deleteCallHistoryFromDatabase(callId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Call history deleted successfully',
    data: result,
  })
})

/**
 * Handles request to fetch scheduled calls for one or all mentors
 */
const getScheduledCalls = catchAsync(async (req, res) => {
  const {calledBy} = req.query
  const result = await CallHistoryServices.getScheduledCallsFromDatabase(calledBy as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Scheduled calls fetched successfully',
    data: result,
  })
})

/**
 * Handles request to fetch all calls conducted today
 */
const getTodayCalls = catchAsync(async (req, res) => {
  const {calledBy} = req.query
  const result = await CallHistoryServices.getTodayCallsFromDatabase(calledBy as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Today calls fetched successfully',
    data: result,
  })
})

export const CallHistoryControllers = {
  createCallHistory,
  getAllCallHistory,
  getCallHistoryById,
  getCallHistoryByStudent,
  updateCallHistory,
  deleteCallHistory,
  getScheduledCalls,
  getTodayCalls,
}
