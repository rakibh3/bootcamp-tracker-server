import { z } from 'zod'

export const createAttendanceValidationSchema = z.object({
  student: z.string(),
  status: z.enum(['ATTENDED', 'ABSENT']),
  mission: z.number(),
  module: z.number(),
  moduleVideo: z.number(),
})

export const updateAttendanceValidationSchema = createAttendanceValidationSchema
  .omit({ student: true })
  .partial()
