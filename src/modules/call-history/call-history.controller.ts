import httpStatus from 'http-status'
import { catchAsync } from '@/utils/catchAsync'
import { sendResponse } from '@/utils/sendResponse'
import { CallHistoryServices } from './call-history.service'

const createCallHistory = catchAsync(async (req, res) => {
  const result = await CallHistoryServices.createCallHistoryIntoDatabase(req.body)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Call history created successfully',
    data: result,
  })
})

const getAllCallHistory = catchAsync(async (req, res) => {
  const { result, meta } = await CallHistoryServices.getAllCallHistoryFromDatabase(req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Call history fetched successfully',
    data: { calls: result, meta },
  })
})

const getCallHistoryById = catchAsync(async (req, res) => {
  const { callId } = req.params
  const result = await CallHistoryServices.getCallHistoryByIdFromDatabase(callId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Call history fetched successfully',
    data: result,
  })
})

const getCallHistoryByStudent = catchAsync(async (req, res) => {
  const { studentId } = req.params
  const result = await CallHistoryServices.getCallHistoryByStudentFromDatabase(studentId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Call history fetched successfully',
    data: result,
  })
})

const updateCallHistory = catchAsync(async (req, res) => {
  const { callId } = req.params
  const result = await CallHistoryServices.updateCallHistoryInDatabase(callId, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Call history updated successfully',
    data: result,
  })
})

const deleteCallHistory = catchAsync(async (req, res) => {
  const { callId } = req.params
  const result = await CallHistoryServices.deleteCallHistoryFromDatabase(callId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Call history deleted successfully',
    data: result,
  })
})

const getScheduledCalls = catchAsync(async (req, res) => {
  const { calledBy } = req.query
  const result = await CallHistoryServices.getScheduledCallsFromDatabase(calledBy as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Scheduled calls fetched successfully',
    data: result,
  })
})

const getTodayCalls = catchAsync(async (req, res) => {
  const { calledBy } = req.query
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
