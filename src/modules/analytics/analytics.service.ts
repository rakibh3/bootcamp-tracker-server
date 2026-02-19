import mongoose from 'mongoose'
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
  const stats = await Student.aggregate([
    {
      $group: {
        _id: null,
        totalStudents: {$sum: 1},
        activeStudents: {$sum: {$cond: [{$eq: ['$status', 'ACTIVE']}, 1, 0]}},
        inactiveStudents: {$sum: {$cond: [{$eq: ['$status', 'INACTIVE']}, 1, 0]}},
        droppedStudents: {$sum: {$cond: [{$eq: ['$status', 'DROPPED']}, 1, 0]}},
        completedStudents: {$sum: {$cond: [{$eq: ['$status', 'COMPLETED']}, 1, 0]}},
      },
    },
  ])

  const result = stats[0] || {
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    droppedStudents: 0,
    completedStudents: 0,
  }

  return {
    totalStudents: result.totalStudents,
    activeStudents: result.activeStudents,
    inactiveStudents: result.inactiveStudents,
    droppedStudents: result.droppedStudents,
    completedStudents: result.completedStudents,
  }
}

/**
 * Retrieves call history statistics within a given date range
 */
const getCallStatsFromDatabase = async (dateRange?: TDateRange): Promise<TCallStats> => {
  const filter: Record<string, any> = {}

  if (dateRange) {
    filter.calledAt = {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate,
    }
  }

  const stats = await CallHistory.aggregate([
    {$match: filter},
    {
      $facet: {
        counts: [
          {
            $group: {
              _id: null,
              totalCalls: {$sum: 1},
              completedCalls: {$sum: {$cond: [{$eq: ['$status', 'COMPLETED']}, 1, 0]}},
              missedCalls: {
                $sum: {$cond: [{$in: ['$status', ['NO_ANSWER', 'BUSY', 'FAILED']]}, 1, 0]},
              },
              scheduledCalls: {$sum: {$cond: [{$eq: ['$status', 'SCHEDULED']}, 1, 0]}},
            },
          },
        ],
        averageDuration: [
          {$match: {status: 'COMPLETED', duration: {$gt: 0}}},
          {$group: {_id: null, avgDuration: {$avg: '$duration'}}},
        ],
      },
    },
  ])

  const counts = stats[0].counts[0] || {
    totalCalls: 0,
    completedCalls: 0,
    missedCalls: 0,
    scheduledCalls: 0,
  }
  const avgDuration = Math.round(stats[0].averageDuration[0]?.avgDuration || 0)

  return {
    totalCalls: counts.totalCalls,
    completedCalls: counts.completedCalls,
    missedCalls: counts.missedCalls,
    scheduledCalls: counts.scheduledCalls,
    averageDuration: avgDuration,
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

  const totalStudents = await User.countDocuments({role: 'STUDENT'})

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
        totalPresent: {
          $sum: {$cond: [{$eq: ['$status', 'ATTENDED']}, 1, 0]},
        },
        totalAbsent: {
          $sum: {$cond: [{$eq: ['$status', 'ABSENT']}, 1, 0]},
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        totalPresent: 1,
        totalAbsent: 1,
        attendanceRate: {
          $cond: [
            {$gt: [totalStudents, 0]},
            {$multiply: [{$divide: ['$totalPresent', totalStudents]}, 100]},
            0,
          ],
        },
      },
    },
    {$sort: {date: 1}},
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

  const [callStats, assignedStudents] = await Promise.all([
    CallHistory.aggregate([
      {$match: {calledBy: new mongoose.Types.ObjectId(srmId)}},
      {
        $group: {
          _id: null,
          totalCalls: {$sum: 1},
          callsToday: {
            $sum: {
              $cond: [
                {$and: [{$gte: ['$calledAt', startOfDay]}, {$lte: ['$calledAt', endOfDay]}]},
                1,
                0,
              ],
            },
          },
          callsThisWeek: {
            $sum: {
              $cond: [
                {$and: [{$gte: ['$calledAt', startOfWeek]}, {$lte: ['$calledAt', endOfDay]}]},
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
    Student.find({assignedSrmId: srmId})
      .populate('userId', 'name email phone discordUsername')
      .lean(),
  ])

  const stats = callStats[0] || {totalCalls: 0, callsToday: 0, callsThisWeek: 0}

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
    totalCalls: stats.totalCalls,
    callsToday: stats.callsToday,
    callsThisWeek: stats.callsThisWeek,
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
