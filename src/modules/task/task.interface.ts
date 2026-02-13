import {Types} from 'mongoose'

export type TTask = {
  mission: number
  moduleNumber: number
  guideline: string
  dueDate: Date
  createdBy: Types.ObjectId
}
