import { model, Schema } from 'mongoose'
import { TUser, UserModel } from './user.interface'

const attendanceRecordSchema = new Schema(
  {
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
    _id: false,
  },
)

const userSchema = new Schema<TUser, UserModel>(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ['STUDENT', 'ADMIN', 'SUPER_ADMIN', 'SRM'],
      default: 'STUDENT',
    },
    attendance: {
      type: [attendanceRecordSchema],
      default: [],
    },
    smtpConfig: {
      appPassword: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// Check if the user exists
userSchema.statics.isUserExists = async function (email: string) {
  return await User.findOne({ email })
}

export const User = model<TUser, UserModel>('User', userSchema)
