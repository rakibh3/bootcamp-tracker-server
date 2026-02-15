import {
  TAttendanceStats,
  TCallStats,
  TDateRange,
  TStudentStats,
} from '@/modules/analytics/analytics.interface'
import {Attendance} from '@/modules/attendance/attendance.model'
import {CallHistory} from '@/modules/call-history/call-history.model'
import {Student} from '@/modules/student/student.model'
import {User} from '@/modules/user/user.model'
import {getDhakaTimeRange} from '@/utils'

/**
 * Calculates student attendance statistics for the current day
 */
const getAttendanceStatsFromDatabase = async (): Promise<TAttendanceStats> => {
  const {startOfDay, endOfDay} = getDhakaTimeRange()

  const totalStudents = await User.countDocuments({role: 'STUDENT'})

  const presentToday = await Attendance.countDocuments({
    status: 'ATTENDED',
    date: {$gte: startOfDay, $lte: endOfDay},
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

/**
 * Retrieves aggregate statistics of students grouped by their status
 */
const getStudentStatsFromDatabase = async (): Promise<TStudentStats> => {
  const [totalStudents, activeStudents, inactiveStudents, droppedStudents, completedStudents] =
    await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({status: 'ACTIVE'}),
      Student.countDocuments({status: 'INACTIVE'}),
      Student.countDocuments({status: 'DROPPED'}),
      Student.countDocuments({status: 'COMPLETED'}),
    ])

  return {
    totalStudents,
    activeStudents,
    inactiveStudents,
    droppedStudents,
    completedStudents,
  }
}

/**
 * Retrieves call history statistics within a given date range
 */
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
    CallHistory.countDocuments({...filter, status: 'COMPLETED'}),
    CallHistory.countDocuments({...filter, status: {$in: ['NO_ANSWER', 'BUSY', 'FAILED']}}),
    CallHistory.countDocuments({...filter, status: 'SCHEDULED'}),
  ])

  const durationResult = await CallHistory.aggregate([
    {$match: {...filter, status: 'COMPLETED', duration: {$gt: 0}}},
    {$group: {_id: null, avgDuration: {$avg: '$duration'}}},
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

/**
 * Compiles comprehensive dashboard analytics including recent attendance activity
 */
const getDashboardAnalyticsFromDatabase = async () => {
  const [attendance, students, calls] = await Promise.all([
    getAttendanceStatsFromDatabase(),
    getStudentStatsFromDatabase(),
    getCallStatsFromDatabase(),
  ])

  const recentActivity = await Attendance.aggregate([
    {$sort: {date: -1}},
    {$limit: 10},
    {
      $lookup: {
        from: 'users',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student',
      },
    },
    {$unwind: '$student'},
    {
      $project: {
        _id: 0,
        student: {_id: '$student._id', name: '$student.name', email: '$student.email'},
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

/**
 * Generates an attendance trend over a specified number of days
 */
const getAttendanceTrendFromDatabase = async (days: number = 7) => {
  const {endOfDay: endDate} = getDhakaTimeRange()
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - days)

  const trend = await Attendance.aggregate([
    {
      $match: {
        date: {$gte: startDate, $lte: endDate},
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {format: '%Y-%m-%d', date: '$date'},
        },
        present: {
          $sum: {$cond: [{$eq: ['$status', 'ATTENDED']}, 1, 0]},
        },
        absent: {
          $sum: {$cond: [{$eq: ['$status', 'ABSENT']}, 1, 0]},
        },
        total: {$sum: 1},
      },
    },
    {$sort: {_id: 1}},
  ])

  return trend
}

/**
 * Analyzes performance metrics for an SRM, including their assigned students' activity
 */
const getSRMPerformanceFromDatabase = async (srmId: string) => {
  const {startOfDay, endOfDay} = getDhakaTimeRange()
  const startOfWeek = new Date(startOfDay)
  startOfWeek.setDate(startOfWeek.getDate() - 7)

  const [totalCalls, callsToday, callsThisWeek, assignedStudents] = await Promise.all([
    CallHistory.countDocuments({calledBy: srmId}),
    CallHistory.countDocuments({
      calledBy: srmId,
      calledAt: {$gte: startOfDay, $lte: endOfDay},
    }),
    CallHistory.countDocuments({
      calledBy: srmId,
      calledAt: {$gte: startOfWeek, $lte: endOfDay},
    }),
    Student.find({assignedSrmId: srmId})
      .populate('userId', 'name email phone discordUsername')
      .lean(),
  ])

  const studentUserIds = assignedStudents.map((s: any) => s.userId?._id)

  const allAttendance = await Attendance.find({
    studentId: {$in: studentUserIds},
  })
    .sort({date: -1})
    .lean()

  const attendanceMap = new Map()
  allAttendance.forEach((record: any) => {
    const key = record.studentId.toString()
    if (!attendanceMap.has(key)) {
      attendanceMap.set(key, [])
    }
    attendanceMap.get(key).push(record)
  })

  // Fetch all call history for assigned students in a single query
  const allCallHistory = await CallHistory.find({
    student: {$in: studentUserIds},
  })
    .sort({calledAt: -1})
    .lean()

  const callHistoryMap = new Map()
  allCallHistory.forEach((call: any) => {
    const studentId = call.student.toString()
    if (!callHistoryMap.has(studentId)) {
      callHistoryMap.set(studentId, [])
    }
    callHistoryMap.get(studentId).push(call)
  })

  const resolvedStudents = assignedStudents.map((student: any) => {
    const userId = student.userId?._id?.toString()
    const studentAttendance = attendanceMap.get(userId) || []
    const recentAttendance = studentAttendance.slice(0, 10)

    const callHistory = callHistoryMap.get(userId) || []

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
      callHistory: callHistory.map((c: any) => {
        const date = new Date(c.calledAt || c.createdAt)
        const months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ]
        const formattedDate = `${date.getDate()} ${months[date.getMonth()]}`

        let outcome = c.status
        if (c.status === 'COMPLETED') outcome = 'Received'
        else if (c.status === 'NO_ANSWER') outcome = 'Not Received'
        else if (c.status === 'BUSY') outcome = 'Busy'
        else if (c.status === 'FAILED') outcome = 'Not Received'
        else if (c.status === 'SCHEDULED') outcome = 'Not Received'

        const isToday =
          date.getTime() >= startOfDay.getTime() && date.getTime() <= endOfDay.getTime()

        return {
          date: formattedDate,
          outcome,
          note: c.notes,
          isToday,
        }
      }),
      riskLevel: attendanceRate < 50 ? 'High' : attendanceRate < 80 ? 'Medium' : 'Low',
    }
  })

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
  getSRMPerformanceFromDatabase,
}
