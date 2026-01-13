import { z } from 'zod'

export const userValidationSchema = z.object({
  name: z.string().min(2, 'Name is required').optional(),

  email: z.string().email('Invalid email address').min(1, 'Email is required'),

  role: z
    .enum(['ADMIN', 'STUDENT', 'SUPER_ADMIN'], {
      required_error: 'Role is required',
      invalid_type_error: 'Role must be a string',
      message: 'Role must be one of "ADMIN", "STUDENT", "SUPER_ADMIN"',
    })
    .optional(),
})

export const userRoleUpdateValidationSchema = z.object({
  role: z
    .enum(['ADMIN', 'STUDENT', 'SUPER_ADMIN'], {
      required_error: 'Role is required',
      invalid_type_error: 'Role must be a string',
      message: 'Role must be one of "ADMIN", "USER", "EMPLOYEE"',
    })
    .optional(),
})
