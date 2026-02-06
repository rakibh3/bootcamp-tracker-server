import { Types } from 'mongoose'

export type TAttendance = {
  studentId: Types.ObjectId
  status: 'ATTENDED' | 'ABSENT'
  mission: number
  module: number
  moduleVideo: number
  date: Date
  note?: string
  verificationCode?: string
}

export type TAbsentFilter = 'today' | 'last2days' | 'last3days'
