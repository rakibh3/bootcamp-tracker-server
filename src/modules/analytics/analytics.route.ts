import express from 'express'
import {AnalyticsControllers} from '@/modules/analytics/analytics.controller'

const router = express.Router()

// Route to get dashboard analytics
router.get('/analytics/dashboard', AnalyticsControllers.getDashboardAnalytics)

// Route to get attendance stats
router.get('/analytics/attendance', AnalyticsControllers.getAttendanceStats)

// Route to get attendance trend
router.get('/analytics/attendance/trend', AnalyticsControllers.getAttendanceTrend)

// Route to get student stats
router.get('/analytics/students', AnalyticsControllers.getStudentStats)

// Route to get batch-wise stats
router.get('/analytics/batch', AnalyticsControllers.getBatchWiseStats)

// Route to get call stats
router.get('/analytics/calls', AnalyticsControllers.getCallStats)

// Route to get SRM performance metrics
router.get('/analytics/srm/:srmId', AnalyticsControllers.getSRMPerformance)

export const AnalyticsRoute = router
