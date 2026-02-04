import { z } from 'zod'

export const createAttendanceValidationSchema = z.object({
  studentID: z.string().min(1, 'Student ID is required'),
  status: z.enum(['ATTENDED', 'ABSENT']),
  mission: z.number(),
  module: z.number(),
  moduleVideo: z.number(),
  note: z.string().optional(),
})

export const updateAttendanceValidationSchema = createAttendanceValidationSchema
  .omit({ studentID: true })
  .partial()
