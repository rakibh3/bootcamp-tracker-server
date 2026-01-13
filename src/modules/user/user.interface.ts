/* eslint-disable no-unused-vars */
import { USER_ROLE } from './user.constant'
import { Model } from 'mongoose'

export type TAttendanceRecord = {
  status: 'ATTENDED' | 'ABSENT'
  mission: number
  module: number
  moduleVideo: number
  date: Date
}

export type TUser = {
  name?: string
  email: string
  phone: string
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN'
  attendance?: TAttendanceRecord[]
}

export interface UserModel extends Model<TUser> {
  // Check if the user exists
  isUserExists(email: string): Promise<TUser>
}

export type TUserRole = keyof typeof USER_ROLE
