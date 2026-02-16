import {Types} from 'mongoose'
import {z} from 'zod'

export const createAttendanceValidationSchema = z.object({
  studentId: z
    .string()
    .min(1, 'Student ID is required')
    .refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid student ID format',
    })
    .transform((val) => new Types.ObjectId(val)),
  status: z.enum(['ATTENDED', 'ABSENT']),
  mission: z.coerce.number().min(1).max(8),
  module: z.coerce.number().min(1).max(99),
  note: z.string().optional(),
})

export const updateAttendanceValidationSchema = createAttendanceValidationSchema
  .omit({studentId: true})
  .partial()
