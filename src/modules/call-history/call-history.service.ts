import httpStatus from 'http-status'

import {QueryBuilder} from '@/builder'
import {AppError} from '@/error'
import {TCallHistory} from '@/modules/call-history/call-history.interface'
import {CallHistory} from '@/modules/call-history/call-history.model'

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
    CallHistory.find()
      .populate({
        path: 'student',
        populate: {
          path: 'userId',
          select: 'name email phone',
        },
      })
      .populate('calledBy', 'name email'),
    query,
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields()

  const result = await callHistoryQuery.modelQuery
  const meta = await callHistoryQuery.countTotal()

  const formattedResult = result.map((item) => {
    const call = item.toObject() as any
    if (call.student && call.student.userId) {
      call.student = {
        _id: call.student._id,
        ...call.student.userId,
      }
    }
    return call
  })

  return {result: formattedResult, meta}
}

/**
 * Fetches the details of a specific call history log by ID.
 */
const getCallHistoryByIdFromDatabase = async (callId: string) => {
  const result = await CallHistory.findById(callId)
    .populate({
      path: 'student',
      populate: {
        path: 'userId',
        select: 'name email phone',
      },
    })
    .populate('calledBy', 'name email')

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Call history not found')
  }

  const call = result.toObject() as any
  if (call.student && call.student.userId) {
    call.student = {
      _id: call.student._id,
      ...call.student.userId,
    }
  }

  return call
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
    .populate({
      path: 'student',
      populate: {
        path: 'userId',
        select: 'name email phone',
      },
    })
    .populate('calledBy', 'name email')

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Call history not found')
  }

  const call = result.toObject() as any
  if (call.student && call.student.userId) {
    call.student = {
      _id: call.student._id,
      ...call.student.userId,
    }
  }

  return call
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
    .populate({
      path: 'student',
      populate: {
        path: 'userId',
        select: 'name email phone',
      },
    })
    .populate('calledBy', 'name email')
    .sort({scheduledAt: 1})

  return result.map((item) => {
    const call = item.toObject() as any
    if (call.student && call.student.userId) {
      call.student = {
        _id: call.student._id,
        ...call.student.userId,
      }
    }
    return call
  })
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
    .populate({
      path: 'student',
      populate: {
        path: 'userId',
        select: 'name email phone',
      },
    })
    .populate('calledBy', 'name email')
    .sort({calledAt: -1})

  return result.map((item) => {
    const call = item.toObject() as any
    if (call.student && call.student.userId) {
      call.student = {
        _id: call.student._id,
        ...call.student.userId,
      }
    }
    return call
  })
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
