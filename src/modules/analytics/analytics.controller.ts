import httpStatus from 'http-status'

import {AnalyticsServices} from '@/modules/analytics/analytics.service'
import {AppError} from '@/error'
import {USER_ROLE} from '@/modules/user/user.constant'
import {catchAsync, sendResponse} from '@/utils'

/**
 * Handles request to fetch overall attendance statistics
 */
const getAttendanceStats = catchAsync(async (req, res) => {
  const result = await AnalyticsServices.getAttendanceStatsFromDatabase()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance stats fetched successfully',
    data: result,
  })
})

/**
 * Handles request to fetch student status and distribution stats
 */
const getStudentStats = catchAsync(async (req, res) => {
  const result = await AnalyticsServices.getStudentStatsFromDatabase()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student stats fetched successfully',
    data: result,
  })
})

/**
 * Handles request to fetch call interaction statistics with date filtering
 */
const getCallStats = catchAsync(async (req, res) => {
  const {startDate, endDate} = req.query

  let dateRange
  if (startDate && endDate) {
    dateRange = {
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
    }
  }

  const result = await AnalyticsServices.getCallStatsFromDatabase(dateRange)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Call stats fetched successfully',
    data: result,
  })
})

/**
 * Handles request to fetch a summary of dashboard analytics
 */
const getDashboardAnalytics = catchAsync(async (req, res) => {
  const result = await AnalyticsServices.getDashboardAnalyticsFromDatabase()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard analytics fetched successfully',
    data: result,
  })
})

/**
 * Handles request to fetch attendance trends over a period of time
 */
const getAttendanceTrend = catchAsync(async (req, res) => {
  const {days} = req.query
  const result = await AnalyticsServices.getAttendanceTrendFromDatabase(days ? Number(days) : 7)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance trend fetched successfully',
    data: result,
  })
})

/**
 * Handles request to fetch performance metrics for a specific SRM
 */
const getSRMPerformance = catchAsync(async (req, res) => {
  const {srmId} = req.params
  const user = req.user

  // If requesting user is an SRM, they can only access their own data
  if (user.role === USER_ROLE.SRM && user.id !== srmId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are only authorized to view your own performance metrics',
    )
  }

  const result = await AnalyticsServices.getSRMPerformanceFromDatabase(srmId as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'SRM performance stats fetched successfully',
    data: result,
  })
})

export const AnalyticsControllers = {
  getAttendanceStats,
  getStudentStats,
  getCallStats,
  getDashboardAnalytics,
  getAttendanceTrend,
  getSRMPerformance,
}
