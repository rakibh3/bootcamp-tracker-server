import {model, Schema} from 'mongoose'

import {TCallHistory} from './call-history.interface'

const callHistorySchema = new Schema<TCallHistory>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    calledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    callType: {
      type: String,
      enum: ['FOLLOW_UP', 'REMINDER', 'SUPPORT', 'FEEDBACK'],
      required: true,
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'NO_ANSWER', 'BUSY', 'FAILED', 'SCHEDULED'],
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
    scheduledAt: {
      type: Date,
    },
    calledAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// Index for efficient queries
callHistorySchema.index({student: 1, calledAt: -1})
callHistorySchema.index({calledBy: 1, calledAt: -1})

export const CallHistory = model<TCallHistory>('CallHistory', callHistorySchema)
