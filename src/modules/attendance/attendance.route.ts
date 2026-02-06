import express from 'express'

import {auth, validateRequest} from '@/middlewares'
import {AttendanceController} from '@/modules/attendance/attendance.controller'
import {
  createAttendanceValidationSchema,
  updateAttendanceValidationSchema,
} from '@/modules/attendance/attendance.validation'
import {USER_ROLE} from '@/modules/user/user.constant'

const router = express.Router()

router.post(
  '/create-attendance',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.STUDENT),
  validateRequest(createAttendanceValidationSchema),
  AttendanceController.createAttendance,
)

router.get(
  '/get-attendance',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.SRM),
  AttendanceController.getAttendance,
)

router.get(
  '/get-attendance/srm',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.SRM),
  AttendanceController.getSrmStudentsAttendance,
)

router.get(
  '/get-attendance/student',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.SRM, USER_ROLE.STUDENT),
  AttendanceController.getStudentAttendance,
)

router.get(
  '/get-attendance/:studentId',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.SRM, USER_ROLE.STUDENT),
  AttendanceController.getAttendanceById,
)

router.patch(
  '/update-attendance/:attendanceId',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.SRM),
  validateRequest(updateAttendanceValidationSchema),
  AttendanceController.updateAttendance,
)

router.delete(
  '/delete-attendance/:attendanceId',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  AttendanceController.deleteAttendance,
)

// Attendance Window Control Routes
router.post(
  '/open-window',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  AttendanceController.openAttendanceWindow,
)

router.post(
  '/close-window',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  AttendanceController.closeAttendanceWindow,
)

router.get(
  '/window-status',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.SRM, USER_ROLE.STUDENT),
  AttendanceController.getAttendanceWindowStatus,
)

// Mark Absent Route (Admin Only)
router.post(
  '/mark-absent',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  AttendanceController.markAbsent,
)

export const AttendanceRoute = router
