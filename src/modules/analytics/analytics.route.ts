import express from 'express'

import {auth} from '@/middlewares'
import {AnalyticsControllers} from '@/modules/analytics/analytics.controller'
import {USER_ROLE} from '@/modules/user/user.constant'

const router = express.Router()

// Route to get dashboard analytics
router.get(
  '/analytics/dashboard',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  AnalyticsControllers.getDashboardAnalytics,
)

// Route to get attendance stats
router.get(
  '/analytics/attendance',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  AnalyticsControllers.getAttendanceStats,
)

// Route to get attendance trend
router.get(
  '/analytics/attendance/trend',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  AnalyticsControllers.getAttendanceTrend,
)

// Route to get student stats
router.get(
  '/analytics/students',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  AnalyticsControllers.getStudentStats,
)

// Route to get call stats
router.get(
  '/analytics/calls',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  AnalyticsControllers.getCallStats,
)

// Route to get SRM performance metrics
router.get(
  '/analytics/srm/:srmId',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  AnalyticsControllers.getSRMPerformance,
)

export const AnalyticsRoute = router
