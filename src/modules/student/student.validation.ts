import {z} from 'zod'

export const createStudentValidationSchema = z.object({
  user: z.string().min(1, 'User ID is required'),
  enrollmentDate: z.coerce.date().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  notes: z.string().optional(),
})

export const updateStudentValidationSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  currentMission: z.number().min(1).optional(),
  currentModule: z.number().min(1).optional(),
  notes: z.string().optional(),
})

export const studentQueryValidationSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})
