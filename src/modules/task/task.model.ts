import { model, Schema } from 'mongoose'
import { TTask } from './task.interface'

const taskSchema = new Schema<TTask>(
  {
    mission: {
      type: Number,
      required: true,
    },
    moduleNumber: {
      type: Number,
      required: true,
    },
    videoNumber: {
      type: String,
      required: true,
    },
    guideline: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const Task = model<TTask>('Task', taskSchema)
