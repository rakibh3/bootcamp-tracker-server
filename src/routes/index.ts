import {Router} from 'express'

import {AnalyticsRoute} from '@/modules/analytics/analytics.route'
import {AttendanceRoute} from '@/modules/attendance/attendance.route'
import {CallHistoryRoute} from '@/modules/call-history/call-history.route'
import {EmailRoute} from '@/modules/email/email.route'
import {OTPRoute} from '@/modules/otp/otp.route'
import {StudentRoute} from '@/modules/student/student.route'
import {TaskRoute} from '@/modules/task/task.route'
import {UserRoute} from '@/modules/user/user.route'

const router = Router()

// Mounting all module routes
router.use(OTPRoute)
router.use(UserRoute)
router.use(AttendanceRoute)
router.use(TaskRoute)
router.use(StudentRoute)
router.use(CallHistoryRoute)
router.use(AnalyticsRoute)
router.use(EmailRoute)

export default router
