import {model, Schema} from 'mongoose'

import {TStudent} from './student.interface'

const studentSchema = new Schema<TStudent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    discordUsername: {
      type: String,
      required: true,
    },
    enrollmentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    currentMission: {
      type: Number,
      default: 1,
    },
    currentModule: {
      type: Number,
      default: 1,
    },
    assignedSrmId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const Student = model<TStudent>('Student', studentSchema)
