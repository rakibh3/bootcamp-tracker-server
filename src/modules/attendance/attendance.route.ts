import express from 'express'
import { AttendanceController } from './attendance.controller'
import { validateRequest } from '@/middlewares/validateRequest'
import {
  createAttendanceValidationSchema,
  updateAttendanceValidationSchema,
} from './attendance.validation'
import auth from '@/middlewares/auth'

const router = express.Router()

router.post(
  '/create-attendance',
  auth('ADMIN', 'SUPER_ADMIN', 'SRM', 'STUDENT'),
  validateRequest(createAttendanceValidationSchema),
  AttendanceController.createAttendance,
)
router.get('/get-attendance', auth('ADMIN'), AttendanceController.getAttendance)
router.get(
  '/get-attendance/srm',
  auth('SRM'),
  AttendanceController.getSrmStudentsAttendance,
)
router.get(
  '/get-attendance/student',
  auth('STUDENT'),
  AttendanceController.getStudentAttendance,
)
router.get('/get-attendance/:studentId', AttendanceController.getAttendanceById)

router.patch(
  '/update-attendance/:studentId/:attendanceIndex',
  validateRequest(updateAttendanceValidationSchema),
  AttendanceController.updateAttendance,
)
router.delete(
  '/delete-attendance/:studentId/:attendanceIndex',
  auth('ADMIN', 'SUPER_ADMIN'),
  AttendanceController.deleteAttendance,
)

// Attendance Window Control Routes
router.post(
  '/open-window',
  auth('ADMIN', 'SUPER_ADMIN'),
  AttendanceController.openAttendanceWindow,
)
router.post(
  '/close-window',
  auth('ADMIN', 'SUPER_ADMIN'),
  AttendanceController.closeAttendanceWindow,
)
router.get('/window-status', AttendanceController.getAttendanceWindowStatus)

// Mark Absent Route (Admin Only)
router.post(
  '/mark-absent',
  auth('ADMIN', 'SUPER_ADMIN'),
  AttendanceController.markAbsent,
)

export const AttendanceRoute = router
