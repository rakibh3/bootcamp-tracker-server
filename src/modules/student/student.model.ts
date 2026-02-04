import { model, Schema } from 'mongoose'
import { TStudent } from './student.interface'

const studentSchema = new Schema<TStudent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    discordUsername: {
      type: String,
      required: true,
    },
    batchNumber: {
      type: Number,
      required: true,
    },
    enrollmentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'DROPPED', 'COMPLETED'],
      default: 'ACTIVE',
    },
    totalAttendance: {
      type: Number,
      default: 0,
    },
    completedModules: {
      type: Number,
      default: 0,
    },
    currentMission: {
      type: Number,
      default: 1,
    },
    currentModule: {
      type: Number,
      default: 1,
    },
    notes: {
      type: String,
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
