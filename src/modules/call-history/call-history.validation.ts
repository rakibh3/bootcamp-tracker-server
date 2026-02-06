import {z} from 'zod'

export const createCallHistoryValidationSchema = z.object({
  student: z.string().min(1, 'Student ID is required'),
  calledBy: z.string().min(1, 'Caller ID is required'),
  callType: z.enum(['FOLLOW_UP', 'REMINDER', 'SUPPORT', 'FEEDBACK'], {
    message: 'Call type is required',
  }),
  status: z.enum(['COMPLETED', 'NO_ANSWER', 'BUSY', 'FAILED', 'SCHEDULED'], {
    message: 'Call status is required',
  }),
  duration: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  scheduledAt: z.coerce.date().optional(),
  calledAt: z.coerce.date().optional(),
})

export const updateCallHistoryValidationSchema = z.object({
  callType: z.enum(['FOLLOW_UP', 'REMINDER', 'SUPPORT', 'FEEDBACK']).optional(),
  status: z.enum(['COMPLETED', 'NO_ANSWER', 'BUSY', 'FAILED', 'SCHEDULED']).optional(),
  duration: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  scheduledAt: z.coerce.date().optional(),
  calledAt: z.coerce.date().optional(),
})

export const callHistoryQueryValidationSchema = z.object({
  student: z.string().optional(),
  calledBy: z.string().optional(),
  callType: z.enum(['FOLLOW_UP', 'REMINDER', 'SUPPORT', 'FEEDBACK']).optional(),
  status: z.enum(['COMPLETED', 'NO_ANSWER', 'BUSY', 'FAILED', 'SCHEDULED']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
})
