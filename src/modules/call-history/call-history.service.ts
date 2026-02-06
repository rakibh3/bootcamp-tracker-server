import httpStatus from 'http-status'
import AppError from '@/error/AppError'
import { TCallHistory } from './call-history.interface'
import { CallHistory } from './call-history.model'
import QueryBuilder from '@/builder/QueryBuilder'

const createCallHistoryIntoDatabase = async (payload: TCallHistory) => {
  const result = await CallHistory.create(payload)
  return result
}

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

  return { result, meta }
}

const getCallHistoryByIdFromDatabase = async (callId: string) => {
  const result = await CallHistory.findById(callId)
    .populate('student', 'name email phone')
    .populate('calledBy', 'name email')

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Call history not found')
  }

  return result
}

const getCallHistoryByStudentFromDatabase = async (studentId: string) => {
  const result = await CallHistory.find({ student: studentId })
    .populate('calledBy', 'name email')
    .sort({ calledAt: -1 })

  return result
}

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

const deleteCallHistoryFromDatabase = async (callId: string) => {
  const result = await CallHistory.findByIdAndDelete(callId)

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Call history not found')
  }

  return result
}

const getScheduledCallsFromDatabase = async (calledBy?: string) => {
  const filter: Record<string, unknown> = { status: 'SCHEDULED' }
  if (calledBy) {
    filter.calledBy = calledBy
  }

  const result = await CallHistory.find(filter)
    .populate('student', 'name email phone')
    .populate('calledBy', 'name email')
    .sort({ scheduledAt: 1 })

  return result
}

const getTodayCallsFromDatabase = async (calledBy?: string) => {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const filter: Record<string, unknown> = {
    calledAt: { $gte: startOfDay, $lte: endOfDay },
  }

  if (calledBy) {
    filter.calledBy = calledBy
  }

  const result = await CallHistory.find(filter)
    .populate('student', 'name email phone')
    .populate('calledBy', 'name email')
    .sort({ calledAt: -1 })

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
