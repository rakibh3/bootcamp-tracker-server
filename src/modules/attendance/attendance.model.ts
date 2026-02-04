import { model, Schema } from 'mongoose'
import { TAttendance } from './attendance.interface'

const attendanceSchema = new Schema<TAttendance>(
  {
    studentID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['ATTENDED', 'ABSENT'],
      default: 'ABSENT',
    },
    mission: {
      type: Number,
      required: true,
    },
    module: {
      type: Number,
      required: true,
    },
    moduleVideo: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const Attendance = model<TAttendance>('Attendance', attendanceSchema)
