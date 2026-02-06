import { z } from 'zod'

export const createAttendanceValidationSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  status: z.enum(['ATTENDED', 'ABSENT']),
  mission: z.number(),
  module: z.number(),
  moduleVideo: z.number(),
  note: z.string().optional(),
  verificationCode: z.string().optional(),
})

export const updateAttendanceValidationSchema = createAttendanceValidationSchema
  .omit({ studentId: true, verificationCode: true })
  .partial()
