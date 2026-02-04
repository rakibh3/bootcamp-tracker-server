import { z } from 'zod'

export const createCallHistoryValidationSchema = z.object({
  student: z.string().min(1, 'Student ID is required'),
  calledBy: z.string().min(1, 'Caller ID is required'),
  callType: z.enum(['FOLLOW_UP', 'REMINDER', 'SUPPORT', 'FEEDBACK'], {
    required_error: 'Call type is required',
  }),
  status: z.enum(['COMPLETED', 'NO_ANSWER', 'BUSY', 'FAILED', 'SCHEDULED'], {
    required_error: 'Call status is required',
  }),
  duration: z.number().min(0).optional(),
  notes: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  calledAt: z.string().datetime().optional(),
})

export const updateCallHistoryValidationSchema = z.object({
  callType: z.enum(['FOLLOW_UP', 'REMINDER', 'SUPPORT', 'FEEDBACK']).optional(),
  status: z.enum(['COMPLETED', 'NO_ANSWER', 'BUSY', 'FAILED', 'SCHEDULED']).optional(),
  duration: z.number().min(0).optional(),
  notes: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  calledAt: z.string().datetime().optional(),
})

export const callHistoryQueryValidationSchema = z.object({
  student: z.string().optional(),
  calledBy: z.string().optional(),
  callType: z.enum(['FOLLOW_UP', 'REMINDER', 'SUPPORT', 'FEEDBACK']).optional(),
  status: z.enum(['COMPLETED', 'NO_ANSWER', 'BUSY', 'FAILED', 'SCHEDULED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})
