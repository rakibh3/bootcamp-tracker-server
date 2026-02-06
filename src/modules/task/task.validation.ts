import {z} from 'zod'

export const createTaskValidationSchema = z.object({
  mission: z.coerce
    .number({
      message: 'Mission number is required',
    })
    .int('Mission number must be an integer')
    .positive('Mission number must be positive'),

  moduleNumber: z.coerce
    .number({
      message: 'Module number is required',
    })
    .int('Module number must be an integer')
    .positive('Module number must be positive'),

  videoNumber: z
    .string({
      message: 'Video number is required',
    })
    .min(1, 'Video number cannot be empty'),

  guideline: z
    .string({
      message: 'Guideline is required',
    })
    .min(1, 'Guideline cannot be empty'),

  dueDate: z
    .string({
      message: 'Due date is required',
    })
    .datetime({message: 'Invalid ISO date format'}),

  createdBy: z
    .string({
      message: 'Created by is required',
    })
    .min(1, 'Created by cannot be empty'),
})

export const updateTaskValidationSchema = z.object({
  mission: z.coerce
    .number()
    .int('Mission number must be an integer')
    .positive('Mission number must be positive')
    .optional(),

  moduleNumber: z.coerce
    .number()
    .int('Module number must be an integer')
    .positive('Module number must be positive')
    .optional(),

  videoNumber: z
    .string({
      message: 'Video number must be a string',
    })
    .min(1, 'Video number cannot be empty')
    .optional(),

  guideline: z
    .string({
      message: 'Guideline must be a string',
    })
    .min(1, 'Guideline cannot be empty')
    .optional(),

  dueDate: z.string().datetime({message: 'Invalid ISO date format'}).optional(),

  createdBy: z
    .string({
      message: 'Created by must be a string',
    })
    .min(1, 'Created by cannot be empty')
    .optional(),
})
