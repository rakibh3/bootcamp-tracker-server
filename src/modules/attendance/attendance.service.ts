import httpStatus from 'http-status'

import {AppError} from '@/error'
import {TAbsentFilter, TAttendance} from '@/modules/attendance/attendance.interface'
import {Attendance} from '@/modules/attendance/attendance.model'
import {AttendanceWindow} from '@/modules/attendance/attendance-window.model'
import {CallHistory} from '@/modules/call-history/call-history.model'
import {Student} from '@/modules/student/student.model'
import {User} from '@/modules/user/user.model'
import {getDhakaTime, getDhakaTimeRange} from '@/utils'
import {getCache, invalidateCache, setCache} from '@/utils/redisCache'

const STUDENT_ATTENDANCE_CACHE_TTL = 172800 // 2 days

import mongoose from 'mongoose'
import {
  buildAttendanceMap,
  calculateAttendanceStats,
  filterByAbsentFilter,
  filterBySearchTerm,
} from './attendance.utils'

/**
 * Creates a student attendance record after verifying window status and Student profile existence.
 *
 * Business Rules:
 * - Attendance window must be open
 * - User must exist and have STUDENT role
 * - User must have a Student profile (enrolled student)
 * - One attendance per student per day
 * - Stores User ID for optimal query performance
 */
const createAttendanceInDatabase = async (payload: TAttendance) => {
  // Step 1: Verify attendance window is open
  const windowStatus = await AttendanceWindow.findOne()

  if (!windowStatus || windowStatus.isOpen === false) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Attendance window is currently closed. Please wait for admin to open it.',
    )
  }

  const {startOfDay, endOfDay, dhakaTime} = getDhakaTimeRange()

  // Step 2: Validate User exists
  const user = await User.findById(payload.studentId)
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, `User not found with ID: ${payload.studentId}`)
  }

  // Step 3: Validate User has STUDENT role
  if (user.role !== 'STUDENT') {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `User must have STUDENT role to create attendance. Current role: ${user.role}`,
    )
  }

  // Step 4: Validate Student profile exists
  const studentProfile = await Student.findOne({userId: payload.studentId})
  if (!studentProfile) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'User must have a Student profile to create attendance. Please contact admin to create your student profile.',
    )
  }

  // Step 5: Check for duplicate attendance on the same day
  const existingAttendance = await Attendance.findOne({
    studentId: payload.studentId,
    date: {$gte: startOfDay, $lte: endOfDay},
  })

  if (existingAttendance) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Attendance already created for today. You can only create one attendance per day.',
    )
  }

  // Step 6: Create attendance record with User ID
  const result = await Attendance.create({
    ...payload,
    date: dhakaTime,
  })

  await invalidateCache(
    `cache:attendance:student:${payload.studentId}`,
    'cache:attendance:list:*',
    'cache:attendance:srm:*',
  )

  return result
}

/**
 * Retrieves all attendance records with student profiles
 * and optional absent filters.
 */
const getAttendanceFromDatabase = async (query: Record<string, unknown>, userId: string) => {
  // Per-user cache key with query params (private route)
  const searchTerm = (query.searchTerm as string) || ''
  const absentFilter = (query.absentFilter as string) || ''
  const cacheKey = `cache:attendance:list:${userId}:${searchTerm}:${absentFilter}`
  const cached = await getCache(cacheKey)
  if (cached) return cached

  const students = await User.find({role: 'STUDENT'})
    .select('name email phone role createdAt updatedAt')
    .lean()

  const studentIds = students.map((s) => s._id)

  const [studentProfilesData, allAttendanceData, allCallHistoryData] = await Promise.all([
    Student.find({userId: {$in: studentIds}})
      .select('userId discordUsername assignedSrmId')
      .populate('assignedSrmId', 'name email')
      .lean(),
    Attendance.find({studentId: {$in: studentIds}})
      .select('studentId status mission module date note')
      .sort({date: -1})
      .lean(),
    CallHistory.find({student: {$in: studentIds}})
      .select('student status notes calledAt createdAt')
      .sort({calledAt: -1})
      .lean(),
  ])

  const profileMap = new Map(studentProfilesData.map((p: any) => [p.userId.toString(), p]))

  // Build Call History Map
  const callHistoryMap = new Map()
  allCallHistoryData.forEach((call: any) => {
    const studentId = call.student.toString()
    if (!callHistoryMap.has(studentId)) {
      callHistoryMap.set(studentId, [])
    }
    callHistoryMap.get(studentId).push(call)
  })

  const attendanceMap = buildAttendanceMap(allAttendanceData)

  let filteredStudents = filterBySearchTerm(students, query.searchTerm as string | undefined)
  filteredStudents = filterByAbsentFilter(
    filteredStudents,
    attendanceMap,
    query.absentFilter as TAbsentFilter | undefined,
  )

  const result = filteredStudents.map((student) => {
    const studentObj = student as any
    const profile = profileMap.get(studentObj._id.toString())
    const attendance = attendanceMap.get(studentObj._id.toString()) || []
    const callHistory = callHistoryMap.get(studentObj._id.toString()) || []

    if (profile) {
      studentObj.discordUsername = profile.discordUsername
      studentObj.assignedSrmId = profile.assignedSrmId
    }

    const stats = calculateAttendanceStats(attendance)

    // Format call history for frontend
    const formattedCallHistory = callHistory.map((call: any) => {
      const date = new Date(call.calledAt || call.createdAt)
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

      let outcome = call.status
      if (call.status === 'COMPLETED') outcome = 'Received'
      else if (call.status === 'NO_ANSWER') outcome = 'Not Received'
      else if (call.status === 'BUSY') outcome = 'Busy'
      else if (call.status === 'FAILED') outcome = 'Not Received'
      else if (call.status === 'SCHEDULED') outcome = 'Not Received'
      else if (call.status === 'FOREIGN_NUMBER') outcome = 'Foreign Number'

      const {startOfDay, endOfDay} = getDhakaTimeRange()
      const isToday = date.getTime() >= startOfDay.getTime() && date.getTime() <= endOfDay.getTime()

      return {
        date: formattedDate,
        outcome,
        note: call.notes,
        isToday,
      }
    })

    return {
      ...studentObj,
      attendance: stats.attendanceWithIndex,
      attendancePercentage: stats.attendancePercentage,
      totalPresent: stats.totalPresent,
      totalAbsent: stats.totalAbsent,
      callHistory: formattedCallHistory,
    }
  })

  await setCache(cacheKey, result, STUDENT_ATTENDANCE_CACHE_TTL)
  return result
}

/**
 * Fetches attendance data for students assigned to
 * a specific SRM.
 */
const getSrmStudentsAttendanceFromDatabase = async (
  srmId: string,
  query: Record<string, unknown>,
) => {
  // Per-user cache key with query params (private route)
  const searchTerm = (query.searchTerm as string) || ''
  const absentFilter = (query.absentFilter as string) || ''
  const cacheKey = `cache:attendance:srm:${srmId}:${searchTerm}:${absentFilter}`
  const cached = await getCache(cacheKey)
  if (cached) return cached

  const assignedStudents = await Student.find({assignedSrmId: srmId}).select(
    'userId discordUsername',
  )
  const studentUserIds = assignedStudents.map((s) => s.userId)
  const profileMap = new Map(assignedStudents.map((s) => [s.userId.toString(), s]))

  const students = await User.find({_id: {$in: studentUserIds}}).select(
    'name email phone role createdAt updatedAt',
  )

  const allAttendance = await Attendance.find({studentId: {$in: studentUserIds}}).sort({
    date: -1,
  })

  // Fetch Call History
  const allCallHistory = await CallHistory.find({student: {$in: studentUserIds}}).sort({
    calledAt: -1,
  })

  // Build Call History Map
  const callHistoryMap = new Map()
  allCallHistory.forEach((call) => {
    const studentId = call.student.toString()
    if (!callHistoryMap.has(studentId)) {
      callHistoryMap.set(studentId, [])
    }
    callHistoryMap.get(studentId).push(call)
  })

  const attendanceMap = buildAttendanceMap(allAttendance)

  let filteredStudents = filterBySearchTerm(students, query.searchTerm as string | undefined)
  filteredStudents = filterByAbsentFilter(
    filteredStudents,
    attendanceMap,
    query.absentFilter as TAbsentFilter | undefined,
  )

  const result = filteredStudents.map((student) => {
    const studentObj = student.toObject() as any
    const profile = profileMap.get(studentObj._id.toString())
    const attendance = attendanceMap.get(studentObj._id.toString()) || []
    const callHistory = callHistoryMap.get(studentObj._id.toString()) || []

    if (profile) {
      studentObj.discordUsername = profile.discordUsername
    }

    const stats = calculateAttendanceStats(attendance)

    // Format call history for frontend
    const formattedCallHistory = callHistory.map((call: any) => {
      const date = new Date(call.calledAt || call.createdAt)
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

      let outcome = call.status
      if (call.status === 'COMPLETED') outcome = 'Received'
      else if (call.status === 'NO_ANSWER') outcome = 'Not Received'
      else if (call.status === 'BUSY') outcome = 'Busy'
      else if (call.status === 'FAILED') outcome = 'Not Received'
      else if (call.status === 'SCHEDULED') outcome = 'Not Received'
      else if (call.status === 'FOREIGN_NUMBER') outcome = 'Foreign Number'

      const {startOfDay, endOfDay} = getDhakaTimeRange()
      const isToday = date.getTime() >= startOfDay.getTime() && date.getTime() <= endOfDay.getTime()

      return {
        date: formattedDate,
        outcome,
        note: call.notes,
        isToday,
      }
    })

    return {
      ...studentObj,
      attendance: stats.attendanceWithIndex,
      attendancePercentage: stats.attendancePercentage,
      totalPresent: stats.totalPresent,
      totalAbsent: stats.totalAbsent,
      callHistory: formattedCallHistory,
    }
  })

  await setCache(cacheKey, result, STUDENT_ATTENDANCE_CACHE_TTL)
  return result
}

/**
 * Retrieves full attendance history and stats for
 * a specific student.
 */
const getAttendanceByIdFromDatabase = async (id: string) => {
  // Per-user cache key (auth validates JWT before this is called)
  const cacheKey = `cache:attendance:student:${id}`
  const cached = await getCache(cacheKey)
  if (cached) return cached

  const student = await User.findById(id).select('name email phone role createdAt updatedAt')
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
  }

  const profile = await Student.findOne({userId: id}).select('discordUsername')

  const attendance = await Attendance.find({studentId: id}).sort({date: -1})

  const result = student.toObject() as any

  if (profile) {
    result.discordUsername = profile.discordUsername
  }

  const totalPresent = attendance.filter((a) => a.status === 'ATTENDED').length
  const totalAbsent = attendance.filter((a) => a.status === 'ABSENT').length
  const totalAttendance = totalPresent + totalAbsent
  const attendancePercentage =
    totalAttendance > 0 ? Number(((totalPresent / totalAttendance) * 100).toFixed(2)) : 0

  result.attendance = attendance.map((record, index) => ({
    ...record.toObject(),
    attendanceIndex: index,
  }))

  const data = {
    ...result,
    totalPresent,
    totalAbsent,
    attendancePercentage,
  }

  await setCache(cacheKey, data, STUDENT_ATTENDANCE_CACHE_TTL)
  return data
}

/**
 * Updates a specific attendance record by its ID.
 */
const updateAttendanceInDatabase = async (attendanceId: string, payload: Partial<TAttendance>) => {
  const attendance = await Attendance.findById(attendanceId)
  if (!attendance) {
    throw new AppError(httpStatus.NOT_FOUND, 'Attendance record not found')
  }

  const result = await Attendance.findByIdAndUpdate(attendanceId, payload, {
    new: true,
    runValidators: true,
  })

  await invalidateCache(
    `cache:attendance:student:${attendance.studentId}`,
    'cache:attendance:list:*',
    'cache:attendance:srm:*',
  )

  return result
}

/**
 * Deletes a specific attendance record from the database.
 */
const deleteAttendanceFromDatabase = async (attendanceId: string) => {
  const attendance = await Attendance.findById(attendanceId)
  if (!attendance) {
    throw new AppError(httpStatus.NOT_FOUND, 'Attendance record not found')
  }

  await Attendance.findByIdAndDelete(attendanceId)
  await invalidateCache(
    `cache:attendance:student:${attendance.studentId}`,
    'cache:attendance:list:*',
    'cache:attendance:srm:*',
  )
  return {message: 'Attendance record deleted successfully'}
}

/**
 * Opens the attendance window and optionally sets
 * a verification code.
 */
const openAttendanceWindow = async (adminId: string, verificationCode?: string) => {
  let windowStatus = await AttendanceWindow.findOne()

  if (!windowStatus) {
    windowStatus = await AttendanceWindow.create({
      isOpen: true,
      verificationCode,
      openedBy: adminId,
      openedAt: new Date(),
    })
  } else {
    windowStatus.isOpen = true
    windowStatus.verificationCode = verificationCode
    windowStatus.openedBy = adminId as any
    windowStatus.openedAt = new Date()
    windowStatus.closedAt = undefined
    await windowStatus.save()
  }

  await invalidateCache('cache:attendance:list:*', 'cache:attendance:srm:*')

  return windowStatus
}

/**
 * Closes the currently open attendance window.
 */
const closeAttendanceWindow = async () => {
  let windowStatus = await AttendanceWindow.findOne()

  if (!windowStatus) {
    windowStatus = await AttendanceWindow.create({isOpen: false})
  } else {
    windowStatus.isOpen = false
    windowStatus.closedAt = new Date()
    await windowStatus.save()
  }

  await invalidateCache('cache:attendance:list:*', 'cache:attendance:srm:*')

  return windowStatus
}

/**
 * Retrieves the current status (open/closed) of the
 * attendance window.
 */
const getAttendanceWindowStatus = async () => {
  let windowStatus = await AttendanceWindow.findOne()

  if (!windowStatus) {
    windowStatus = await AttendanceWindow.create({isOpen: false})
  }

  return windowStatus
}

/**
 * Batch marks all students who haven't submitted
 * attendance for a specific date as absent.
 */
const markUsersAbsentForDate = async (targetDate?: Date) => {
  /* 
    If no date is provided, default to yesterday (Dhaka time).
    Using getDhakaTime() ensures we respect the timezone offset 
    before subtracting 24 hours.
  */
  const dateToMark = targetDate
    ? new Date(targetDate)
    : new Date(getDhakaTime().getTime() - 24 * 60 * 60 * 1000)

  const {startOfDay, endOfDay} = getDhakaTimeRange(dateToMark)

  const now = getDhakaTimeRange()
  if (startOfDay > now.startOfDay) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot mark users absent for future dates. Please provide a past or current date.',
    )
  }

  const allStudents = await User.find({role: 'STUDENT'}).select('_id')
  const allStudentIds = allStudents.map((s) => s._id)

  const studentsWithAttendance = await Attendance.find({
    studentId: {$in: allStudentIds},
    date: {$gte: startOfDay, $lte: endOfDay},
  }).select('studentId')

  const studentsWithAttendanceIds = new Set(
    studentsWithAttendance.map((a) => a.studentId.toString()),
  )

  const studentsWithoutAttendance = allStudentIds.filter(
    (id) => !studentsWithAttendanceIds.has(id.toString()),
  )

  const absentRecords = studentsWithoutAttendance.map((studentId) => ({
    studentId,
    status: 'ABSENT' as const,
    mission: 0,
    module: 0,
    moduleVideo: 0,
    date: startOfDay,
  }))

  let result = null
  if (absentRecords.length > 0) {
    result = await Attendance.insertMany(absentRecords)
    await invalidateCache('cache:attendance:student:*', 'cache:attendance:list:*', 'cache:attendance:srm:*')
  }

  return {
    totalStudents: allStudents.length,
    studentsWithAttendance: studentsWithAttendance.length,
    studentsMarkedAbsent: studentsWithoutAttendance.length,
    targetDate: startOfDay,
    insertedCount: result ? result.length : 0,
  }
}

export const AttendanceService = {
  createAttendanceInDatabase,
  getAttendanceFromDatabase,
  getAttendanceByIdFromDatabase,
  updateAttendanceInDatabase,
  deleteAttendanceFromDatabase,
  openAttendanceWindow,
  closeAttendanceWindow,
  getAttendanceWindowStatus,
  markUsersAbsentForDate,
  getSrmStudentsAttendanceFromDatabase,
}
