export type TAttendanceStats = {
  totalStudents: number
  presentToday: number
  absentToday: number
  attendanceRate: number
}

export type TStudentStats = {
  totalStudents: number
  activeStudents: number
  inactiveStudents: number
  droppedStudents: number
  completedStudents: number
}

export type TCallStats = {
  totalCalls: number
  completedCalls: number
  missedCalls: number
  scheduledCalls: number
  averageDuration: number
}

export type TDashboardAnalytics = {
  attendance: TAttendanceStats
  students: TStudentStats
  calls: TCallStats
  recentActivity: unknown[]
}

export type TDateRange = {
  startDate: Date
  endDate: Date
}
