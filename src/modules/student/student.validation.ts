import {z} from 'zod'

export const createStudentValidationSchema = z.object({
  user: z.string().min(1, 'User ID is required'),
  batchNumber: z.number().min(1, 'Batch number must be at least 1'),
  enrollmentDate: z.coerce.date().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  notes: z.string().optional(),
})

export const updateStudentValidationSchema = z.object({
  batchNumber: z.number().min(1, 'Batch number must be at least 1').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  currentMission: z.number().min(1).optional(),
  currentModule: z.number().min(1).optional(),
  notes: z.string().optional(),
})

export const studentQueryValidationSchema = z.object({
  batchNumber: z.coerce.number().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})
