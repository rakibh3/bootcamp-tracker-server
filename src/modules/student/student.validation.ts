import {z} from 'zod'

export const createStudentValidationSchema = z.object({
  name: z.string().optional(),
  email: z.email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  discordUsername: z.string().min(1, 'Discord username is required'),
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
