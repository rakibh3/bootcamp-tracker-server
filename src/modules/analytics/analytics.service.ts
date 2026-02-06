import { Attendance } from '../attendance/attendance.model'
import { Student } from '../student/student.model'
import { CallHistory } from '../call-history/call-history.model'
import { User } from '../user/user.model'
import { getDhakaTimeRange } from '@/utils/dhakaTime.utils'
import { TAttendanceStats, TStudentStats, TCallStats, TDateRange } from './analytics.interface'

const getAttendanceStatsFromDatabase = async (): Promise<TAttendanceStats> => {
  const { startOfDay, endOfDay } = getDhakaTimeRange()

  // Count total students
  const totalStudents = await User.countDocuments({ role: 'STUDENT' })

  // Count students who attended today
  const presentToday = await Attendance.countDocuments({
    status: 'ATTENDED',
    date: { $gte: startOfDay, $lte: endOfDay },
  })

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

  // Get recent activity (last 10 attendance records) from Attendance collection
  const recentActivity = await Attendance.aggregate([
    { $sort: { date: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },
    {
      $project: {
        _id: 0,
        student: { _id: '$student._id', name: '$student.name', email: '$student.email' },
        status: 1,
        mission: 1,
        module: 1,
        date: 1,
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

  const trend = await Attendance.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' },
        },
        present: {
          $sum: { $cond: [{ $eq: ['$status', 'ATTENDED'] }, 1, 0] },
        },
        absent: {
          $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] },
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
      .populate('userId', 'name email phone discordUsername')
      .lean(),
  ])

  // Get attendance and call history for assigned students
  const studentUserIds = assignedStudents.map((s: any) => s.userId?._id)

  // Fetch all attendance for these students
  const allAttendance = await Attendance.find({
    studentId: { $in: studentUserIds },
  })
    .sort({ date: -1 })
    .lean()

  // Group attendance by student
  const attendanceMap = new Map()
  allAttendance.forEach((record: any) => {
    const key = record.studentId.toString()
    if (!attendanceMap.has(key)) {
      attendanceMap.set(key, [])
    }
    attendanceMap.get(key).push(record)
  })

  // Process students with their attendance
  const resolvedStudents = await Promise.all(
    assignedStudents.map(async (student: any) => {
      const userId = student.userId?._id?.toString()
      const studentAttendance = attendanceMap.get(userId) || []

      // Get recent 10 attendance records
      const recentAttendance = studentAttendance.slice(0, 10)

      // Get call history for this student
      const callHistory = await CallHistory.find({
        student: student.userId?._id,
        calledBy: srmId,
      })
        .sort({ calledAt: -1 })
        .limit(10)
        .lean()

      // Calculate attendance percentage
      const attendedCount = studentAttendance.filter((a: any) => a.status === 'ATTENDED').length
      const totalPossibleAttendance = studentAttendance.length

      const attendanceRate =
        totalPossibleAttendance > 0 ? (attendedCount / totalPossibleAttendance) * 100 : 100

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
