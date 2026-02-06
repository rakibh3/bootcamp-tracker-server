import httpStatus from 'http-status'

import {AppError} from '@/error'
import {TAbsentFilter, TAttendance} from '@/modules/attendance/attendance.interface'
import {Attendance} from '@/modules/attendance/attendance.model'
import {AttendanceWindow} from '@/modules/attendance/attendance-window.model'
import {Student} from '@/modules/student/student.model'
import {User} from '@/modules/user/user.model'
import {
  buildAttendanceMap,
  calculateAttendanceStats,
  filterByAbsentFilter,
  filterBySearchTerm,
  getDhakaTimeRange,
} from '@/utils'

/**
 * Creates a student attendance record after verifying
 * window status and existence.
 */
const createAttendanceInDatabase = async (payload: TAttendance) => {
  let windowStatus = await AttendanceWindow.findOne()

  if (!windowStatus) {
    windowStatus = await AttendanceWindow.create({isOpen: false})
  }

  if (!windowStatus.isOpen) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Attendance window is currently closed. Please wait for admin to open it.',
    )
  }

  if (windowStatus.verificationCode && payload.verificationCode !== windowStatus.verificationCode) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Invalid verification code. Please check with your mentor.',
    )
  }

  const {startOfDay, endOfDay, dhakaTime} = getDhakaTimeRange()

  const student = await User.findById(payload.studentId)
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
  }

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

  const result = await Attendance.create({
    studentId: payload.studentId,
    status: payload.status,
    mission: payload.mission,
    module: payload.module,
    moduleVideo: payload.moduleVideo,
    note: payload.note,
    date: dhakaTime,
  })

  return result
}

/**
 * Retrieves all attendance records with student profiles
 * and optional absent filters.
 */
const getAttendanceFromDatabase = async (query: Record<string, unknown>) => {
  const students = await User.find({role: 'STUDENT'}).select(
    'name email phone role createdAt updatedAt',
  )

  const studentProfiles = await Student.find({
    userId: {$in: students.map((s) => s._id)},
  })
    .select('userId discordUsername assignedSrmId')
    .populate('assignedSrmId', 'name email')

  const profileMap = new Map(studentProfiles.map((p) => [p.userId.toString(), p]))

  const studentIds = students.map((s) => s._id)
  const allAttendance = await Attendance.find({studentId: {$in: studentIds}}).sort({
    date: -1,
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

    if (profile) {
      studentObj.discordUsername = profile.discordUsername
      studentObj.assignedSrmId = profile.assignedSrmId
    }

    const stats = calculateAttendanceStats(attendance)

    return {
      ...studentObj,
      attendance: stats.attendanceWithIndex,
      attendancePercentage: stats.attendancePercentage,
      totalPresent: stats.totalPresent,
      totalAbsent: stats.totalAbsent,
    }
  })

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

    if (profile) {
      studentObj.discordUsername = profile.discordUsername
    }

    const stats = calculateAttendanceStats(attendance)

    return {
      ...studentObj,
      attendance: stats.attendanceWithIndex,
      attendancePercentage: stats.attendancePercentage,
      totalPresent: stats.totalPresent,
      totalAbsent: stats.totalAbsent,
    }
  })

  return result
}

/**
 * Retrieves full attendance history and stats for
 * a specific student.
 */
const getAttendanceByIdFromDatabase = async (id: string) => {
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

  return {
    ...result,
    totalPresent,
    totalAbsent,
    attendancePercentage,
  }
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
  const dateToMark = targetDate || new Date(Date.now() - 24 * 60 * 60 * 1000)
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
