import { Types } from 'mongoose'

export type TStudent = {
  userId: Types.ObjectId
  phone: string
  discordUsername: string
  // batchNumber: number
  enrollmentDate: Date
  isBlocked?: boolean
  status: 'ACTIVE' | 'INACTIVE'
  totalAttendance: number
  currentMission: number
  currentModule: number
  notes?: string
  assignedSrmId?: Types.ObjectId
}
