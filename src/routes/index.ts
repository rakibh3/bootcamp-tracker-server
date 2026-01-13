import { Router } from 'express'
import { OTPRoute } from '@/modules/otp/otp.route'
import { UserRoute } from '@/modules/user/user.route'
import { AttendanceRoute } from '@/modules/attendance/attendance.route'

const router = Router()

// Mounting all module routes
router.use(OTPRoute)
router.use(UserRoute)
router.use(AttendanceRoute)

export default router
