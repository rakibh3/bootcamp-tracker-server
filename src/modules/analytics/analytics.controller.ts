import httpStatus from 'http-status'
import { catchAsync } from '@/utils/catchAsync'
import { sendResponse } from '@/utils/sendResponse'
import { AnalyticsServices } from './analytics.service'

const getAttendanceStats = catchAsync(async (req, res) => {
  const result = await AnalyticsServices.getAttendanceStatsFromDatabase()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance stats fetched successfully',
    data: result,
  })
})

const getStudentStats = catchAsync(async (req, res) => {
  const result = await AnalyticsServices.getStudentStatsFromDatabase()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student stats fetched successfully',
    data: result,
  })
})

const getCallStats = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query

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

const getDashboardAnalytics = catchAsync(async (req, res) => {
  const result = await AnalyticsServices.getDashboardAnalyticsFromDatabase()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard analytics fetched successfully',
    data: result,
  })
})

const getAttendanceTrend = catchAsync(async (req, res) => {
  const { days } = req.query
  const result = await AnalyticsServices.getAttendanceTrendFromDatabase(days ? Number(days) : 7)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance trend fetched successfully',
    data: result,
  })
})

const getBatchWiseStats = catchAsync(async (req, res) => {
  const result = await AnalyticsServices.getBatchWiseStatsFromDatabase()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch-wise stats fetched successfully',
    data: result,
  })
})

const getSRMPerformance = catchAsync(async (req, res) => {
  const { srmId } = req.params
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
  getBatchWiseStats,
  getSRMPerformance,
}
