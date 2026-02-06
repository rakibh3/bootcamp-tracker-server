import {model, Schema} from 'mongoose'
import {TAttendanceWindow} from './attendance-window.interface'

const attendanceWindowSchema = new Schema<TAttendanceWindow>(
  {
    isOpen: {
      type: Boolean,
      required: true,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    openedBy: {
      type: Schema.Types.ObjectId,
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

export const AttendanceWindow = model<TAttendanceWindow>('AttendanceWindow', attendanceWindowSchema)
