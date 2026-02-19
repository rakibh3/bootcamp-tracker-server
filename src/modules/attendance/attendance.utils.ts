import {TAbsentFilter, TAttendance} from '@/modules/attendance/attendance.interface'
import {getDhakaTimeRange} from '@/utils/dhakaTime.utils'

/**
 * Builds a map of attendance records grouped by student ID
 */
export const buildAttendanceMap = (attendanceRecords: any[]): Map<string, TAttendance[]> => {
  const attendanceMap = new Map<string, TAttendance[]>()
  attendanceRecords.forEach((record) => {
    const key = record.studentId.toString()
    if (!attendanceMap.has(key)) {
      attendanceMap.set(key, [])
    }
    attendanceMap.get(key)!.push(record as TAttendance)
  })
  return attendanceMap
}

/**
 * Filters students by search term (name or email)
 */
export const filterBySearchTerm = (students: any[], searchTerm?: string) => {
  if (!searchTerm) return students
  const searchRegex = new RegExp(searchTerm, 'i')
  return students.filter((s) => searchRegex.test(s.name || '') || searchRegex.test(s.email))
}

/**
 * Filters students by absent filter criteria
 */
export const filterByAbsentFilter = (
  students: any[],
  attendanceMap: Map<string, TAttendance[]>,
  absentFilter?: TAbsentFilter,
) => {
  if (!absentFilter) return students
  const filterDays = absentFilter === 'today' ? 1 : absentFilter === 'last2days' ? 2 : 3
  const {dhakaTime} = getDhakaTimeRange()
  const filterDate = new Date(dhakaTime)
  filterDate.setDate(filterDate.getDate() - filterDays + 1)
  const {startOfDay: filterStart} = getDhakaTimeRange(filterDate)

  return students.filter((student) => {
    const studentAttendance = attendanceMap.get(student._id.toString()) || []
    const recentRecords = studentAttendance.filter((a) => new Date(a.date) >= filterStart)
    return recentRecords.length === 0 || recentRecords.every((a) => a.status === 'ABSENT')
  })
}

/**
 * Calculates attendance statistics for a student
 */
export const calculateAttendanceStats = (attendance: TAttendance[]) => {
  const totalPresent = attendance.filter((a) => a.status === 'ATTENDED').length
  const totalAbsent = attendance.filter((a) => a.status === 'ABSENT').length
  const totalAttendance = totalPresent + totalAbsent
  const attendancePercentage =
    totalAttendance > 0 ? Number(((totalPresent / totalAttendance) * 100).toFixed(2)) : 0

  const attendanceWithIndex = attendance.map((record, index) => ({
    ...record,
    attendanceIndex: index,
  }))

  return {totalPresent, totalAbsent, attendancePercentage, attendanceWithIndex}
}
