import { Types } from 'mongoose'

export type TAttendance = {
  studentID: Types.ObjectId
  status: 'ATTENDED' | 'ABSENT'
  mission: number
  module: number
  moduleVideo: number
  note?: string
  verificationCode?: string
}

export type TAbsentFilter = 'today' | 'last2days' | 'last3days'
