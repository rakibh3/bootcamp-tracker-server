/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { ErrorRequestHandler } from 'express'
import httpStatus from 'http-status'
import { ZodError } from 'zod'

import { handleZodValidationError } from '@/error/zodError'
import { handleCastValidationError } from './castError'
import { handleDuplicateValidationError } from './duplicateError'

export const globalErrorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next,
) => {
  // Handle Zod Validation Error
  if (error instanceof ZodError) {
    const result = handleZodValidationError(error)

    return res.status(result.statusCode).json({
      success: false,
      message: result.errorMessage,
      errorDetails: result.errorDetails,
    })
  }

  // Handle Cast Validation Error
  if (error?.name === 'CastError') {
    const result = handleCastValidationError(error)
    return res.status(result.statusCode).json({
      success: false,
      message: result.message,
      errorMessage: result.errorMessage,
      errorDetails: result.errorDetails,
      stack: result.stack,
    })
  }

  // Handle Duplicate Validation Error
  if (error.code === 11000) {
    const result = handleDuplicateValidationError(error)

    return res.status(result.statusCode).json({
      success: false,
      message: result.message,
      errorMessage: result.errorMessage,
      errorDetails: result.errorDetails,
      stack: result.stack,
    })
  }

  // Handle other errors
  const statusCode = error.statusCode || 500
  const message = error.message || 'Something went wrong!'

  return res.status(statusCode).json({
    success: false,
    message,
    errorDetails: error,
  })
}
