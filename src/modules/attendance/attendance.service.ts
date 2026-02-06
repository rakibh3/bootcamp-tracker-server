import AppError from '@/error/AppError'
import { TAbsentFilter, TAttendance } from './attendance.interface'
import httpStatus from 'http-status'
import { User } from '../user/user.model'
import { AttendanceWindow } from './attendance-window.model'
import { getDhakaTimeRange } from '@/utils/dhakaTime.utils'
import { Student } from '../student/student.model'
import { Attendance } from './attendance.model'
import QueryBuilder from '@/builder/QueryBuilder'

const createAttendanceInDatabase = async (payload: TAttendance) => {
  // Check if attendance window is open
  let windowStatus = await AttendanceWindow.findOne()

  // If no window document exists, create one with default closed state
  if (!windowStatus) {
    windowStatus = await AttendanceWindow.create({ isOpen: false })
  }

  if (!windowStatus.isOpen) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Attendance window is currently closed. Please wait for admin to open it.',
    )
  }

  // Check verification code if it's set in the window
  if (windowStatus.verificationCode && payload.verificationCode !== windowStatus.verificationCode) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Invalid verification code. Please check with your mentor.',
    )
  }

  const { startOfDay, endOfDay, dhakaTime } = getDhakaTimeRange()

  // Check if student exists
  const student = await User.findById(payload.studentId)

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
  }

  // Check if attendance already exists for today
  const existingAttendance = await Attendance.findOne({
    studentId: payload.studentId,
    date: { $gte: startOfDay, $lte: endOfDay },
  })

  if (existingAttendance) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Attendance already created for today. You can only create one attendance per day.',
    )
  }

  // Create attendance record in the Attendance collection
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

const getAttendanceFromDatabase = async (query: Record<string, unknown>) => {
  const { startOfDay, endOfDay } = getDhakaTimeRange()

  // Get all students with their profile data
  const students = await User.find({ role: 'STUDENT' }).select(
    'name email phone role createdAt updatedAt',
  )

  // Fetch student profiles
  const studentProfiles = await Student.find({
    userId: { $in: students.map((s) => s._id) },
  })
    .select('userId discordUsername assignedSrmId')
    .populate('assignedSrmId', 'name email')

  const profileMap = new Map(studentProfiles.map((p) => [p.userId.toString(), p]))

  // Fetch all attendance records for these students
  const studentIds = students.map((s) => s._id)
  const allAttendance = await Attendance.find({ studentId: { $in: studentIds } }).sort({
    date: -1,
  })

  // Group attendance by student
  const attendanceMap = new Map<string, TAttendance[]>()
  allAttendance.forEach((record) => {
    const key = record.studentId.toString()
    if (!attendanceMap.has(key)) {
      attendanceMap.set(key, [])
    }
    attendanceMap.get(key)!.push(record.toObject() as TAttendance)
  })

  // Apply absent filter if provided
  let filteredStudents = students
  const absentFilter = query.absentFilter as TAbsentFilter | undefined

  if (absentFilter) {
    const filterDays = absentFilter === 'today' ? 1 : absentFilter === 'last2days' ? 2 : 3
    const filterDate = new Date()
    filterDate.setDate(filterDate.getDate() - filterDays + 1)
    const { startOfDay: filterStart } = getDhakaTimeRange(filterDate)

    filteredStudents = students.filter((student) => {
      const studentAttendance = attendanceMap.get(student._id.toString()) || []
      // Check if student has been absent continuously for the filter period
      const recentRecords = studentAttendance.filter((a) => new Date(a.date) >= filterStart)
      return recentRecords.length === 0 || recentRecords.every((a) => a.status === 'ABSENT')
    })
  }

  // Apply search filter if provided
  const searchTerm = query.searchTerm as string | undefined
  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm, 'i')
    filteredStudents = filteredStudents.filter(
      (s) => searchRegex.test(s.name || '') || searchRegex.test(s.email),
    )
  }

  // Map results with attendance data
  const result = filteredStudents.map((student) => {
    const studentObj = student.toObject() as any
    const profile = profileMap.get(studentObj._id.toString())
    const attendance = attendanceMap.get(studentObj._id.toString()) || []

    if (profile) {
      studentObj.discordUsername = profile.discordUsername
      studentObj.assignedSrmId = profile.assignedSrmId
    }

    // Calculate attendance stats
    const totalPresent = attendance.filter((a) => a.status === 'ATTENDED').length
    const totalAbsent = attendance.filter((a) => a.status === 'ABSENT').length
    const totalAttendance = totalPresent + totalAbsent
    const attendancePercentage =
      totalAttendance > 0 ? Number(((totalPresent / totalAttendance) * 100).toFixed(2)) : 0

    // Add index to each attendance record
    const attendanceWithIndex = attendance.map((record, index) => ({
      ...record,
      attendanceIndex: index,
    }))

    return {
      ...studentObj,
      attendance: attendanceWithIndex,
      attendancePercentage,
      totalPresent,
      totalAbsent,
    }
  })

  return result
}

const getSrmStudentsAttendanceFromDatabase = async (
  srmId: string,
  query: Record<string, unknown>,
) => {
  // Find students assigned to this SRM
  const assignedStudents = await Student.find({ assignedSrmId: srmId }).select(
    'userId discordUsername',
  )
  const studentUserIds = assignedStudents.map((s) => s.userId)

  // Create lookup map
  const profileMap = new Map(assignedStudents.map((s) => [s.userId.toString(), s]))

  // Get users for those student IDs
  const students = await User.find({ _id: { $in: studentUserIds } }).select(
    'name email phone role createdAt updatedAt',
  )

  // Fetch all attendance records for these students
  const allAttendance = await Attendance.find({ studentId: { $in: studentUserIds } }).sort({
    date: -1,
  })

  // Group attendance by student
  const attendanceMap = new Map<string, TAttendance[]>()
  allAttendance.forEach((record) => {
    const key = record.studentId.toString()
    if (!attendanceMap.has(key)) {
      attendanceMap.set(key, [])
    }
    attendanceMap.get(key)!.push(record.toObject() as TAttendance)
  })

  // Apply search filter if provided
  let filteredStudents = students
  const searchTerm = query.searchTerm as string | undefined
  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm, 'i')
    filteredStudents = filteredStudents.filter(
      (s) => searchRegex.test(s.name || '') || searchRegex.test(s.email),
    )
  }

  // Apply absent filter if provided
  const absentFilter = query.absentFilter as TAbsentFilter | undefined
  if (absentFilter) {
    const filterDays = absentFilter === 'today' ? 1 : absentFilter === 'last2days' ? 2 : 3
    const filterDate = new Date()
    filterDate.setDate(filterDate.getDate() - filterDays + 1)
    const { startOfDay: filterStart } = getDhakaTimeRange(filterDate)

    filteredStudents = filteredStudents.filter((student) => {
      const studentAttendance = attendanceMap.get(student._id.toString()) || []
      const recentRecords = studentAttendance.filter((a) => new Date(a.date) >= filterStart)
      return recentRecords.length === 0 || recentRecords.every((a) => a.status === 'ABSENT')
    })
  }

  // Map attendance records to include their index and calculate percentage
  const result = filteredStudents.map((student) => {
    const studentObj = student.toObject() as any
    const profile = profileMap.get(studentObj._id.toString())
    const attendance = attendanceMap.get(studentObj._id.toString()) || []

    if (profile) {
      studentObj.discordUsername = profile.discordUsername
    }

    // Calculate attendance stats
    const totalPresent = attendance.filter((a) => a.status === 'ATTENDED').length
    const totalAbsent = attendance.filter((a) => a.status === 'ABSENT').length
    const totalAttendance = totalPresent + totalAbsent
    const attendancePercentage =
      totalAttendance > 0 ? Number(((totalPresent / totalAttendance) * 100).toFixed(2)) : 0

    // Add index to each attendance record
    const attendanceWithIndex = attendance.map((record, index) => ({
      ...record,
      attendanceIndex: index,
    }))

    return {
      ...studentObj,
      attendance: attendanceWithIndex,
      attendancePercentage,
      totalPresent,
      totalAbsent,
    }
  })

  return result
}

const getAttendanceByIdFromDatabase = async (id: string) => {
  // Get specific student
  const student = await User.findById(id).select('name email phone role createdAt updatedAt')
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
  }

  // Fetch student profile
  const profile = await Student.findOne({ userId: id }).select('discordUsername')

  // Fetch attendance records for this student
  const attendance = await Attendance.find({ studentId: id }).sort({ date: -1 })

  const result = student.toObject() as any

  if (profile) {
    result.discordUsername = profile.discordUsername
  }

  // Calculate total present and absent counts
  const totalPresent = attendance.filter((a) => a.status === 'ATTENDED').length
  const totalAbsent = attendance.filter((a) => a.status === 'ABSENT').length
  const totalAttendance = totalPresent + totalAbsent
  const attendancePercentage =
    totalAttendance > 0 ? Number(((totalPresent / totalAttendance) * 100).toFixed(2)) : 0

  // Add index to each attendance record
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

const deleteAttendanceFromDatabase = async (attendanceId: string) => {
  const attendance = await Attendance.findById(attendanceId)
  if (!attendance) {
    throw new AppError(httpStatus.NOT_FOUND, 'Attendance record not found')
  }

  await Attendance.findByIdAndDelete(attendanceId)
  return { message: 'Attendance record deleted successfully' }
}

// Attendance Window Control Methods
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

const closeAttendanceWindow = async () => {
  let windowStatus = await AttendanceWindow.findOne()

  if (!windowStatus) {
    windowStatus = await AttendanceWindow.create({ isOpen: false })
  } else {
    windowStatus.isOpen = false
    windowStatus.closedAt = new Date()
    await windowStatus.save()
  }

  return windowStatus
}

const getAttendanceWindowStatus = async () => {
  let windowStatus = await AttendanceWindow.findOne()

  if (!windowStatus) {
    windowStatus = await AttendanceWindow.create({ isOpen: false })
  }

  return windowStatus
}

const markUsersAbsentForDate = async (targetDate?: Date) => {
  // Use provided date or default to previous day
  const dateToMark = targetDate || new Date(Date.now() - 24 * 60 * 60 * 1000)

  // Get Dhaka time range for the target date
  const { startOfDay, endOfDay } = getDhakaTimeRange(dateToMark)

  // Prevent marking absent for future dates
  const now = getDhakaTimeRange()
  if (startOfDay > now.startOfDay) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot mark users absent for future dates. Please provide a past or current date.',
    )
  }

  // Find all student user IDs
  const allStudents = await User.find({ role: 'STUDENT' }).select('_id')
  const allStudentIds = allStudents.map((s) => s._id)

  // Find students who already have attendance for the target date
  const studentsWithAttendance = await Attendance.find({
    studentId: { $in: allStudentIds },
    date: { $gte: startOfDay, $lte: endOfDay },
  }).select('studentId')

  const studentsWithAttendanceIds = new Set(
    studentsWithAttendance.map((a) => a.studentId.toString()),
  )

  // Filter students who don't have attendance for the target date
  const studentsWithoutAttendance = allStudentIds.filter(
    (id) => !studentsWithAttendanceIds.has(id.toString()),
  )

  // Create absent attendance records
  const absentRecords = studentsWithoutAttendance.map((studentId) => ({
    studentId,
    status: 'ABSENT' as const,
    mission: 0,
    module: 0,
    moduleVideo: 0,
    date: startOfDay,
  }))

  // Insert all absent records
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
