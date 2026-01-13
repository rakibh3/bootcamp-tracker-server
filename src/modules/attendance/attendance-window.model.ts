import { model, Schema } from 'mongoose'
import { TAttendanceWindow } from './attendance-window.interface'

const attendanceWindowSchema = new Schema<TAttendanceWindow>(
  {
    isOpen: {
      type: Boolean,
      required: true,
      default: false,
    },
    openedBy: {
      type: String,
      ref: 'User',
    },
    openedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const AttendanceWindow = model<TAttendanceWindow>(
  'AttendanceWindow',
  attendanceWindowSchema,
)
