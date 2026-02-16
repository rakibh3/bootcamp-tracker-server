import {Types} from 'mongoose'

export type TCallStatus = 'COMPLETED' | 'NO_ANSWER' | 'BUSY' | 'FAILED' | 'SCHEDULED' | 'FOREIGN_NUMBER'
export type TCallType = 'FOLLOW_UP' | 'REMINDER' | 'SUPPORT' | 'FEEDBACK'

export type TCallHistory = {
  student: Types.ObjectId
  calledBy: Types.ObjectId
  callType: TCallType
  status: TCallStatus
  duration?: number // in seconds
  notes?: string
  scheduledAt?: Date
  calledAt?: Date
}
