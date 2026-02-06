import httpStatus from 'http-status'

import {AttendanceService} from '@/modules/attendance/attendance.service'
import {catchAsync, sendResponse} from '@/utils'

/**
 * Handles request to create a new attendance record
 */
const createAttendance = catchAsync(async (req, res) => {
  const result = await AttendanceService.createAttendanceInDatabase(req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance created successfully',
    data: result,
  })
})

/**
 * Handles request to fetch all attendance records with query filtering
 */
const getAttendance = catchAsync(async (req, res) => {
  const result = await AttendanceService.getAttendanceFromDatabase(req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance fetched successfully',
    data: result,
  })
})

/**
 * Handles request to fetch attendance records for a specific student ID
 */
const getAttendanceById = catchAsync(async (req, res) => {
  const {studentId} = req.params

  const result = await AttendanceService.getAttendanceByIdFromDatabase(studentId as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance fetched successfully',
    data: result,
  })
})

/**
 * Handles request to update an existing attendance record
 */
const updateAttendance = catchAsync(async (req, res) => {
  const {attendanceId} = req.params

  const result = await AttendanceService.updateAttendanceInDatabase(
    attendanceId as string,
    req.body,
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance updated successfully',
    data: result,
  })
})

/**
 * Handles request to delete an attendance record
 */
const deleteAttendance = catchAsync(async (req, res) => {
  const {attendanceId} = req.params

  const result = await AttendanceService.deleteAttendanceFromDatabase(attendanceId as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance deleted successfully',
    data: result,
  })
})

/**
 * Handles request to open the attendance window for students
 */
const openAttendanceWindow = catchAsync(async (req, res) => {
  const adminId = req.user?._id

  const result = await AttendanceService.openAttendanceWindow(adminId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance window opened successfully',
    data: result,
  })
})

/**
 * Handles request to close the attendance window
 */
const closeAttendanceWindow = catchAsync(async (req, res) => {
  const result = await AttendanceService.closeAttendanceWindow()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance window closed successfully',
    data: result,
  })
})

/**
 * Handles request to check the current status of the attendance window
 */
const getAttendanceWindowStatus = catchAsync(async (req, res) => {
  const result = await AttendanceService.getAttendanceWindowStatus()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance window status fetched successfully',
    data: result,
  })
})

/**
 * Handles request to mark all non-attending students as absent for a date
 */
const markAbsent = catchAsync(async (req, res) => {
  const {date} = req.body
  const targetDate = date ? new Date(date) : undefined

  const result = await AttendanceService.markUsersAbsentForDate(targetDate)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Successfully marked ${result.studentsMarkedAbsent} students as absent`,
    data: result,
  })
})

/**
 * Handles request to fetch attendance for students assigned to the calling SRM
 */
const getSrmStudentsAttendance = catchAsync(async (req, res) => {
  const srmId = req.user._id
  const result = await AttendanceService.getSrmStudentsAttendanceFromDatabase(srmId, req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'SRM students attendance fetched successfully',
    data: result,
  })
})

/**
 * Handles request for a student to fetch their own attendance records
 */
const getStudentAttendance = catchAsync(async (req, res) => {
  const userId = req.user._id
  const result = await AttendanceService.getAttendanceByIdFromDatabase(userId as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My attendance fetched successfully',
    data: result,
  })
})

export const AttendanceController = {
  createAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  openAttendanceWindow,
  closeAttendanceWindow,
  getAttendanceWindowStatus,
  markAbsent,
  getSrmStudentsAttendance,
  getStudentAttendance,
}
