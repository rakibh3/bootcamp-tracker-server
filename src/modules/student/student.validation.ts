import { z } from 'zod'

export const createStudentValidationSchema = z.object({
  user: z.string().min(1, 'User ID is required'),
  batchNumber: z.number().min(1, 'Batch number must be at least 1'),
  enrollmentDate: z.date().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  notes: z.string().optional(),
})

export const updateStudentValidationSchema = z.object({
  batchNumber: z.number().min(1, 'Batch number must be at least 1').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  totalAttendance: z.number().min(0).optional(),
  currentMission: z.number().min(1).optional(),
  currentModule: z.number().min(1).optional(),
  notes: z.string().optional(),
})

export const studentQueryValidationSchema = z.object({
  batchNumber: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})
