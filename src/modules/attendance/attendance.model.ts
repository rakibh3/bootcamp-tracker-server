import {model, Schema} from 'mongoose'

import {TAttendance} from './attendance.interface'

const attendanceSchema = new Schema<TAttendance>(
  {
    studentId: {
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
    date: {
      type: Date,
      required: true,
      default: Date.now,
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

// Indexes for efficient queries
attendanceSchema.index({studentId: 1, date: -1})
attendanceSchema.index({date: 1})
attendanceSchema.index({studentId: 1, date: 1}, {unique: true}) // One attendance per student per day

export const Attendance = model<TAttendance>('Attendance', attendanceSchema)
