import { Attendance } from '../attendance/attendance.model'
import { Student } from '../student/student.model'
import { CallHistory } from '../call-history/call-history.model'
import { User } from '../user/user.model'
import { getDhakaTimeRange } from '@/utils/dhakaTime.utils'
import {
  TAttendanceStats,
  TStudentStats,
  TCallStats,
  TDateRange,
} from './analytics.interface'

const getAttendanceStatsFromDatabase = async (): Promise<TAttendanceStats> => {
  const { startOfDay, endOfDay } = getDhakaTimeRange()

  const stats = await User.aggregate([
    { $match: { role: 'STUDENT' } },
    {
      $facet: {
        totalStudents: [{ $count: 'count' }],
        presentToday: [
          { $unwind: '$attendance' },
          {
            $match: {
              'attendance.status': 'ATTENDED',
              'attendance.date': { $gte: startOfDay, $lte: endOfDay },
            },
          },
          { $count: 'count' },
        ],
      },
    },
  ])

  const totalStudents = stats[0]?.totalStudents[0]?.count || 0
  const presentToday = stats[0]?.presentToday[0]?.count || 0
  const absentToday = totalStudents - presentToday
  const attendanceRate = totalStudents > 0 ? (presentToday / totalStudents) * 100 : 0

  return {
    totalStudents,
    presentToday,
    absentToday,
    attendanceRate: Math.round(attendanceRate * 100) / 100,
  }
}

const getStudentStatsFromDatabase = async (): Promise<TStudentStats> => {
  const [totalStudents, activeStudents, inactiveStudents, droppedStudents, completedStudents] =
    await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: 'ACTIVE' }),
      Student.countDocuments({ status: 'INACTIVE' }),
      Student.countDocuments({ status: 'DROPPED' }),
      Student.countDocuments({ status: 'COMPLETED' }),
    ])

  return {
    totalStudents,
    activeStudents,
    inactiveStudents,
    droppedStudents,
    completedStudents,
  }
}

const getCallStatsFromDatabase = async (dateRange?: TDateRange): Promise<TCallStats> => {
  const filter: Record<string, unknown> = {}

  if (dateRange) {
    filter.calledAt = {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate,
    }
  }

  const [totalCalls, completedCalls, missedCalls, scheduledCalls] = await Promise.all([
    CallHistory.countDocuments(filter),
    CallHistory.countDocuments({ ...filter, status: 'COMPLETED' }),
    CallHistory.countDocuments({ ...filter, status: { $in: ['NO_ANSWER', 'BUSY', 'FAILED'] } }),
    CallHistory.countDocuments({ ...filter, status: 'SCHEDULED' }),
  ])

  // Calculate average duration for completed calls
  const durationResult = await CallHistory.aggregate([
    { $match: { ...filter, status: 'COMPLETED', duration: { $gt: 0 } } },
    { $group: { _id: null, avgDuration: { $avg: '$duration' } } },
  ])

  const averageDuration = durationResult.length > 0 ? Math.round(durationResult[0].avgDuration) : 0

  return {
    totalCalls,
    completedCalls,
    missedCalls,
    scheduledCalls,
    averageDuration,
  }
}

const getDashboardAnalyticsFromDatabase = async () => {
  const [attendance, students, calls] = await Promise.all([
    getAttendanceStatsFromDatabase(),
    getStudentStatsFromDatabase(),
    getCallStatsFromDatabase(),
  ])

  // Get recent activity (last 10 attendance records across all users)
  const recentActivity = await User.aggregate([
    { $match: { role: 'STUDENT' } },
    { $unwind: '$attendance' },
    { $sort: { 'attendance.date': -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        student: { _id: '$_id', name: '$name', email: '$email' },
        status: '$attendance.status',
        mission: '$attendance.mission',
        module: '$attendance.module',
        date: '$attendance.date',
      },
    },
  ])

  return {
    attendance,
    students,
    calls,
    recentActivity,
  }
}

const getAttendanceTrendFromDatabase = async (days: number = 7) => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const trend = await User.aggregate([
    { $match: { role: 'STUDENT' } },
    { $unwind: '$attendance' },
    {
      $match: {
        'attendance.date': { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$attendance.date' },
        },
        present: {
          $sum: { $cond: [{ $eq: ['$attendance.status', 'ATTENDED'] }, 1, 0] },
        },
        absent: {
          $sum: { $cond: [{ $eq: ['$attendance.status', 'ABSENT'] }, 1, 0] },
        },
        total: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  return trend
}

const getBatchWiseStatsFromDatabase = async () => {
  const stats = await Student.aggregate([
    {
      $group: {
        _id: '$batchNumber',
        totalStudents: { $sum: 1 },
        activeStudents: {
          $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] },
        },
        avgAttendance: { $avg: '$totalAttendance' },
        avgCompletedModules: { $avg: '$completedModules' },
      },
    },
    { $sort: { _id: 1 } },
  ])

  return stats
}

const getSRMPerformanceFromDatabase = async (srmId: string) => {
  const { startOfDay, endOfDay } = getDhakaTimeRange()
  const startOfWeek = new Date(startOfDay)
  startOfWeek.setDate(startOfWeek.getDate() - 7)

  const [totalCalls, callsToday, callsThisWeek, assignedStudents] = await Promise.all([
    CallHistory.countDocuments({ calledBy: srmId }),
    CallHistory.countDocuments({
      calledBy: srmId,
      calledAt: { $gte: startOfDay, $lte: endOfDay },
    }),
    CallHistory.countDocuments({
      calledBy: srmId,
      calledAt: { $gte: startOfWeek, $lte: endOfDay },
    }),
    Student.find({ assignedSrmId: srmId })
      .populate('userId', 'name email phone discordUsername attendance')
      .lean(),
  ])

  // Process students with their attendance from the user document
  const studentsWithPerformance = assignedStudents.map((student: any) => {
    const userAttendance = student.userId?.attendance || []
    
    // Sort and limit attendance records
    const recentAttendance = [...userAttendance]
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)

    // Get call history for this student
    // Note: We'll still need to query callHistory as it's a separate collection
    return {
      student, // Keep original student data
      studentPromise: CallHistory.find({
        student: student.userId?._id,
        calledBy: srmId,
      })
        .sort({ calledAt: -1 })
        .limit(10)
        .lean(),
      recentAttendance,
    }
  })

  // Resolve call history for all students
  const resolvedStudents = await Promise.all(
    studentsWithPerformance.map(async ({ student, studentPromise, recentAttendance }) => {
      const callHistory = await studentPromise

      // Calculate attendance percentage from user record
      const attendanceRecords = student.userId?.attendance || []
      const attendedCount = attendanceRecords.filter((a: any) => a.status === 'ATTENDED').length
      const totalPossibleAttendance = attendanceRecords.length
      
      const attendanceRate = totalPossibleAttendance > 0 
        ? (attendedCount / totalPossibleAttendance) * 100 
        : 100 // Default to 100 if no records yet

      return {
        ...student,
        recentAttendance: recentAttendance.map((a: any) => ({
          date: a.date,
          status: a.status,
        })),
        callHistory: callHistory.map((c: any) => ({
          date: c.calledAt,
          outcome: c.status,
          note: c.notes,
        })),
        riskLevel: attendanceRate < 50 ? 'High' : attendanceRate < 80 ? 'Medium' : 'Low',
      }
    }),
  )

  return {
    totalCalls,
    callsToday,
    callsThisWeek,
    assignedStudents: assignedStudents.length,
    students: resolvedStudents,
  }
}

export const AnalyticsServices = {
  getAttendanceStatsFromDatabase,
  getStudentStatsFromDatabase,
  getCallStatsFromDatabase,
  getDashboardAnalyticsFromDatabase,
  getAttendanceTrendFromDatabase,
  getBatchWiseStatsFromDatabase,
  getSRMPerformanceFromDatabase,
}
