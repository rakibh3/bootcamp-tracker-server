/* eslint-disable no-unused-vars */
import { USER_ROLE } from './user.constant'
import { Model } from 'mongoose'

export type TUser = {
  name?: string
  email: string
  phone: string
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN' | 'SRM'
  smtpConfig?: {
    appPassword?: string
  }
}

export interface UserModel extends Model<TUser> {
  // Check if the user exists
  isUserExists(email: string): Promise<TUser>
}

export type TUserRole = keyof typeof USER_ROLE
