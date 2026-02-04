import { Types } from 'mongoose'

export type TStudentStatus = 'ACTIVE' | 'INACTIVE' | 'DROPPED' | 'COMPLETED'

export type TStudent = {
  userId: Types.ObjectId
  phone: string
  discordUsername: string
  batchNumber: number
  enrollmentDate: Date
  status: TStudentStatus
  totalAttendance: number
  completedModules: number
  currentMission: number
  currentModule: number
  notes?: string
  assignedSrmId?: Types.ObjectId
}
