import {Types} from 'mongoose'

export type TStudent = {
  userId: Types.ObjectId
  discordUsername: string
  enrollmentDate: Date
  isBlocked?: boolean
  status: 'ACTIVE' | 'INACTIVE'
  currentMission: number
  currentModule: number
  assignedSrmId?: Types.ObjectId
}
