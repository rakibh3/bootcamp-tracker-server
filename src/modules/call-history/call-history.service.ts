import httpStatus from 'http-status'
import AppError from '@/error/AppError'
import {TCallHistory} from '@/modules/call-history/call-history.interface'
import {CallHistory} from '@/modules/call-history/call-history.model'
import QueryBuilder from '@/builder/QueryBuilder'

/**
 * Persists a new call record between an SRM and a student.
 */
const createCallHistoryIntoDatabase = async (payload: TCallHistory) => {
  const result = await CallHistory.create(payload)
  return result
}

/**
 * Retrieves call history logs with student and SRM
 * details using advanced filtering.
 */
const getAllCallHistoryFromDatabase = async (query: Record<string, unknown>) => {
  const searchableFields = ['notes']
  const callHistoryQuery = new QueryBuilder(
    CallHistory.find().populate('student', 'name email phone').populate('calledBy', 'name email'),
    query,
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields()

  const result = await callHistoryQuery.modelQuery
  const meta = await callHistoryQuery.countTotal()

  return {result, meta}
}

/**
 * Fetches the details of a specific call history log by ID.
 */
const getCallHistoryByIdFromDatabase = async (callId: string) => {
  const result = await CallHistory.findById(callId)
    .populate('student', 'name email phone')
    .populate('calledBy', 'name email')

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Call history not found')
  }

  return result
}

/**
 * Retrieves all call interactions for a specific student
 * sorted by date.
 */
const getCallHistoryByStudentFromDatabase = async (studentId: string) => {
  const result = await CallHistory.find({student: studentId})
    .populate('calledBy', 'name email')
    .sort({calledAt: -1})

  return result
}

/**
 * Updates an existing call log with new details or status.
 */
const updateCallHistoryInDatabase = async (callId: string, payload: Partial<TCallHistory>) => {
  const result = await CallHistory.findByIdAndUpdate(callId, payload, {
    new: true,
    runValidators: true,
  })
    .populate('student', 'name email phone')
    .populate('calledBy', 'name email')

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Call history not found')
  }

  return result
}

/**
 * Permanently deletes a call interaction record.
 */
const deleteCallHistoryFromDatabase = async (callId: string) => {
  const result = await CallHistory.findByIdAndDelete(callId)

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Call history not found')
  }

  return result
}

/**
 * Fetches all scheduled calls for a mentor or all mentors.
 */
const getScheduledCallsFromDatabase = async (calledBy?: string) => {
  const filter: Record<string, unknown> = {status: 'SCHEDULED'}
  if (calledBy) {
    filter.calledBy = calledBy
  }

  const result = await CallHistory.find(filter)
    .populate('student', 'name email phone')
    .populate('calledBy', 'name email')
    .sort({scheduledAt: 1})

  return result
}

/**
 * Retrieves all call records completed during the current
 * calendar day.
 */
const getTodayCallsFromDatabase = async (calledBy?: string) => {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const filter: Record<string, unknown> = {
    calledAt: {$gte: startOfDay, $lte: endOfDay},
  }

  if (calledBy) {
    filter.calledBy = calledBy
  }

  const result = await CallHistory.find(filter)
    .populate('student', 'name email phone')
    .populate('calledBy', 'name email')
    .sort({calledAt: -1})

  return result
}

export const CallHistoryServices = {
  createCallHistoryIntoDatabase,
  getAllCallHistoryFromDatabase,
  getCallHistoryByIdFromDatabase,
  getCallHistoryByStudentFromDatabase,
  updateCallHistoryInDatabase,
  deleteCallHistoryFromDatabase,
  getScheduledCallsFromDatabase,
  getTodayCallsFromDatabase,
}
