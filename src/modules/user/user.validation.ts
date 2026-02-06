import {z} from 'zod'

export const userValidationSchema = z.object({
  name: z.string().min(2, 'Name is required').optional(),

  email: z.string().email('Invalid email address').min(1, 'Email is required'),

  role: z
    .enum(['ADMIN', 'STUDENT', 'SRM', 'SUPER_ADMIN'], {
      message: 'Role must be one of "ADMIN", "STUDENT", "SRM", "SUPER_ADMIN"',
    })
    .optional(),
})

export const userRoleUpdateValidationSchema = z.object({
  role: z
    .enum(['ADMIN', 'STUDENT', 'SRM', 'SUPER_ADMIN'], {
      message: 'Role must be one of "ADMIN", "STUDENT", "SRM", "SUPER_ADMIN"',
    })
    .optional(),
})
