import { Types } from 'mongoose'

export type TAttendanceWindow = {
  isOpen: boolean
  verificationCode?: string
  openedBy?: Types.ObjectId
  openedAt?: Date
  closedAt?: Date
}
