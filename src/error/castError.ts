import mongoose from 'mongoose'
import { TErrorResponse } from '../interface/error'

export const handleCastValidationError = (
  error: mongoose.Error.CastError,
): TErrorResponse => {
  const statusCode = 400
  const message = 'Invalid ID'

  const errorMessage = `${error.value} is not a valid ID!`

  return {
    statusCode,
    message,
    errorMessage: errorMessage,
    errorDetails: error,
    stack: error.stack,
  }
}
