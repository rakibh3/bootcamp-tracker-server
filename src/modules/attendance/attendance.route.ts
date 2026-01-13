import express from "express";
import { AttendanceController } from "./attendance.controller";
import { validateRequest } from "@/middlewares/validateRequest";
import { createAttendanceValidationSchema, updateAttendanceValidationSchema } from "./attendance.validation";
import auth from "@/middlewares/auth";

const router = express.Router()


router.post('/create-attendance', validateRequest(createAttendanceValidationSchema), AttendanceController.createAttendance)
router.get('/get-attendance', AttendanceController.getAttendance)
router.get('/get-attendance/:studentId', AttendanceController.getAttendanceById)
router.patch('/update-attendance/:studentId/:attendanceIndex', validateRequest(updateAttendanceValidationSchema), AttendanceController.updateAttendance)
router.delete('/delete-attendance/:studentId/:attendanceIndex', AttendanceController.deleteAttendance)

// Attendance Window Control Routes
router.post('/open-window', AttendanceController.openAttendanceWindow) // TODO: Add admin auth middleware
router.post('/close-window', AttendanceController.closeAttendanceWindow) // TODO: Add admin auth middleware
router.get('/window-status', AttendanceController.getAttendanceWindowStatus)

// Mark Absent Route (Admin Only)
router.post('/mark-absent', 
    // auth('ADMIN', 'SUPER_ADMIN'), 
    AttendanceController.markAbsent)

export const AttendanceRoute = router
