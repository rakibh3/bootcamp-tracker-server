import { z } from 'zod'

export const createTaskValidationSchema = z.object({
  mission: z
    .number({
      required_error: 'Mission number is required',
      invalid_type_error: 'Mission number must be a number',
    })
    .int('Mission number must be an integer')
    .positive('Mission number must be positive'),

  moduleNumber: z
    .number({
      required_error: 'Module number is required',
      invalid_type_error: 'Module number must be a number',
    })
    .int('Module number must be an integer')
    .positive('Module number must be positive'),

  videoNumber: z
    .string({
      required_error: 'Video number is required',
      invalid_type_error: 'Video number must be a string',
    })
    .min(1, 'Video number cannot be empty'),

  guideline: z
    .string({
      required_error: 'Guideline is required',
      invalid_type_error: 'Guideline must be a string',
    })
    .min(1, 'Guideline cannot be empty'),

  dueDate: z
    .string({
      required_error: 'Due date is required',
      invalid_type_error: 'Due date must be a valid date string',
    })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    }),

  createdBy: z
    .string({
      required_error: 'Created by is required',
      invalid_type_error: 'Created by must be a string',
    })
    .min(1, 'Created by cannot be empty'),
})

export const updateTaskValidationSchema = z.object({
  mission: z
    .number({
      invalid_type_error: 'Mission number must be a number',
    })
    .int('Mission number must be an integer')
    .positive('Mission number must be positive')
    .optional(),

  moduleNumber: z
    .number({
      invalid_type_error: 'Module number must be a number',
    })
    .int('Module number must be an integer')
    .positive('Module number must be positive')
    .optional(),

  videoNumber: z
    .string({
      invalid_type_error: 'Video number must be a string',
    })
    .min(1, 'Video number cannot be empty')
    .optional(),

  guideline: z
    .string({
      invalid_type_error: 'Guideline must be a string',
    })
    .min(1, 'Guideline cannot be empty')
    .optional(),

  dueDate: z
    .string({
      invalid_type_error: 'Due date must be a valid date string',
    })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    })
    .optional(),

  createdBy: z
    .string({
      invalid_type_error: 'Created by must be a string',
    })
    .min(1, 'Created by cannot be empty')
    .optional(),
})
