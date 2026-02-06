import { Types } from 'mongoose'

export type TTask = {
  mission: number
  moduleNumber: number
  videoNumber: string
  guideline: string
  dueDate: Date
  createdBy: Types.ObjectId
}
