import AppError from "@/error/AppError"
import { TAbsentFilter, TAttendance } from "./attendance.interface"
import httpStatus from "http-status"
import { User } from "../user/user.model"
import { AttendanceWindow } from "./attendance-window.model"
import { getDhakaTimeRange } from "@/utils/dhakaTime.utils"

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
            'Attendance window is currently closed. Please wait for admin to open it.'
        )
    }

    const { startOfDay, endOfDay, dhakaTime } = getDhakaTimeRange()

    // Check if student already has attendance for today
    const student = await User.findById(payload.student)
    
    if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
    }

    // Check if attendance already exists for today
    const hasAttendanceToday = student.attendance?.some(record => {
        const recordDate = new Date(record.date)
        return recordDate >= startOfDay && recordDate <= endOfDay
    })

    if (hasAttendanceToday) {
        throw new AppError(
            httpStatus.BAD_REQUEST, 
            'Attendance already created for today. You can only create one attendance per day.'
        )
    }

    // Add attendance to student's array
    const result = await User.findByIdAndUpdate(
        payload.student,
        {
            $push: {
                attendance: {
                    status: payload.status,
                    mission: payload.mission,
                    module: payload.module,
                    moduleVideo: payload.moduleVideo,
                    date: dhakaTime
                }
            }
        },
        { new: true, runValidators: true }
    )

    return result
}

const getAttendanceFromDatabase = async (query: Record<string, unknown>) => {
    const { getDhakaTimeRange } = await import('@/utils/dhakaTime.utils')
    const QueryBuilder = (await import('@/builder/QueryBuilder')).default
    
    // Build query using QueryBuilder
    const studentQuery = new QueryBuilder(
        User.find({ role: 'STUDENT' }).select('name email phone role attendance createdAt updatedAt'),
        query
    )
    
    // Apply search for student name and email
    studentQuery.search(['name', 'email'])
    
    // Apply absent filter if provided
    studentQuery.filterAbsent(getDhakaTimeRange)
    
    // Execute query
    const students = await studentQuery.modelQuery
    
    // Map attendance records to include their index
    const result = students.map(student => {
        const studentObj = student.toObject()
        if (studentObj.attendance) {
            studentObj.attendance = studentObj.attendance.map((record: any, index: number) => ({
                ...record,
                attendanceIndex: index // Add index to each record
            }))
        }
        return studentObj
    })
    
    return result
}

const getAttendanceByIdFromDatabase = async (id: string) => {
    // Get specific student with attendance
    const student = await User.findById(id).select('name email phone role attendance createdAt updatedAt')
    if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
    }
    
    // Map attendance records to include their index
    const result = student.toObject()
    
    // Calculate total present and absent counts
    let totalPresent = 0
    let totalAbsent = 0
    
    if (result.attendance) {
        result.attendance = result.attendance.map((record: any, index: number) => {
            // Count attendance status
            if (record.status === 'ATTENDED') {
                totalPresent++
            } else if (record.status === 'ABSENT') {
                totalAbsent++
            }
            
            return {
                ...record,
                attendanceIndex: index // Add index to each record
            }
        })
    }
    
    // Calculate attendance percentage
    const totalAttendance = totalPresent + totalAbsent
    const attendancePercentage = totalAttendance > 0 
        ? Number(((totalPresent / totalAttendance) * 100).toFixed(2))
        : 0
    
    return {
        ...result,
        totalPresent,
        totalAbsent,
        attendancePercentage
    }
}

const updateAttendanceInDatabase = async (
    studentId: string,
    attendanceIndex: number,
    payload: Partial<TAttendance>
) => {
    const student = await User.findById(studentId)
    if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
    }

    if (!student.attendance || attendanceIndex >= student.attendance.length) {
        throw new AppError(httpStatus.NOT_FOUND, 'Attendance record not found')
    }

    const updateFields: Record<string, any> = {}
    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined) {
            updateFields[`attendance.${attendanceIndex}.${key}`] = value
        }
    })

    const result = await User.findByIdAndUpdate(
        studentId,
        { $set: updateFields },
        { new: true, runValidators: true }
    ).select('name email phone role attendance createdAt updatedAt')

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
    }

    return result
}

const deleteAttendanceFromDatabase = async (studentId: string, attendanceIndex: number) => {
    // Remove specific attendance record from array
    const student = await User.findById(studentId)
    
    if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
    }

    if (!student.attendance || attendanceIndex >= student.attendance.length) {
        throw new AppError(httpStatus.NOT_FOUND, 'Attendance record not found')
    }

    student.attendance.splice(attendanceIndex, 1)
    await student.save()

    return student
}

// Attendance Window Control Methods
const openAttendanceWindow = async (adminId: string) => {
    let windowStatus = await AttendanceWindow.findOne()
    
    if (!windowStatus) {
        windowStatus = await AttendanceWindow.create({
            isOpen: true,
            openedBy: adminId,
            openedAt: new Date(),
        })
    } else {
        windowStatus.isOpen = true
        windowStatus.openedBy = adminId
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
    const { startOfDay, endOfDay, dhakaTime: currentDhakaTime } = getDhakaTimeRange(dateToMark)
    
    // Prevent marking absent for future dates
    const now = getDhakaTimeRange()
    if (startOfDay > now.startOfDay) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Cannot mark users absent for future dates. Please provide a past or current date.'
        )
    }
    
    // Find all students
    const allStudents = await User.find({ role: 'STUDENT' })
    
    // Filter students who don't have attendance for the target date
    const studentsWithoutAttendance = allStudents.filter(student => {
        const hasAttendanceForDate = student.attendance?.some(record => {
            const recordDate = new Date(record.date)
            return recordDate >= startOfDay && recordDate <= endOfDay
        })
        return !hasAttendanceForDate
    })
    
    // Prepare bulk update operations
    const bulkOps = studentsWithoutAttendance.map(student => ({
        updateOne: {
            filter: { _id: student._id },
            update: {
                $push: {
                    attendance: {
                        status: 'ABSENT',
                        mission: 0,
                        module: 0,
                        moduleVideo: 0,
                        date: startOfDay
                    }
                }
            }
        }
    }))
    
    // Execute bulk update if there are students to mark absent
    let result = null
    if (bulkOps.length > 0) {
        result = await User.bulkWrite(bulkOps)
    }
    
    return {
        totalStudents: allStudents.length,
        studentsWithAttendance: allStudents.length - studentsWithoutAttendance.length,
        studentsMarkedAbsent: studentsWithoutAttendance.length,
        targetDate: startOfDay,
        bulkWriteResult: result
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
}
