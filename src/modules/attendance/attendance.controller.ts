import { sendResponse } from '@/utils/sendResponse'
import httpStatus from 'http-status'
import { catchAsync } from '@/utils/catchAsync'
import { AttendanceService } from './attendance.service'
import { TAbsentFilter } from './attendance.interface'

const createAttendance = catchAsync(async (req, res) => {
  const { ...payload } = req.body

  const result = await AttendanceService.createAttendanceInDatabase(payload)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance created successfully',
    data: result,
  })
})

const getAttendance = catchAsync(async (req, res) => {
  const result = await AttendanceService.getAttendanceFromDatabase(req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance fetched successfully',
    data: result,
  })
})

const getAttendanceById = catchAsync(async (req, res) => {
  const { studentId } = req.params

  const result = await AttendanceService.getAttendanceByIdFromDatabase(studentId as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance fetched successfully',
    data: result,
  })
})

const updateAttendance = catchAsync(async (req, res) => {
  const { attendanceId } = req.params
  const { ...payload } = req.body

  const result = await AttendanceService.updateAttendanceInDatabase(attendanceId as string, payload)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance updated successfully',
    data: result,
  })
})

const deleteAttendance = catchAsync(async (req, res) => {
  const { attendanceId } = req.params

  const result = await AttendanceService.deleteAttendanceFromDatabase(attendanceId as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance deleted successfully',
    data: result,
  })
})

// Attendance Window Controllers
const openAttendanceWindow = catchAsync(async (req, res) => {
  const adminId = req.user?.id || req.body.adminId // Assuming user is attached by auth middleware

  const result = await AttendanceService.openAttendanceWindow(adminId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance window opened successfully',
    data: result,
  })
})

const closeAttendanceWindow = catchAsync(async (req, res) => {
  const result = await AttendanceService.closeAttendanceWindow()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance window closed successfully',
    data: result,
  })
})

const getAttendanceWindowStatus = catchAsync(async (req, res) => {
  const result = await AttendanceService.getAttendanceWindowStatus()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance window status fetched successfully',
    data: result,
  })
})

const markAbsent = catchAsync(async (req, res) => {
  const { date } = req.body
  const targetDate = date ? new Date(date) : undefined

  const result = await AttendanceService.markUsersAbsentForDate(targetDate)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Successfully marked ${result.studentsMarkedAbsent} students as absent`,
    data: result,
  })
})

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

// Get current student's attendance
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
