/* eslint-disable @typescript-eslint/no-explicit-any */

import { TErrorResponse } from '../interface/error'

export const handleDuplicateValidationError = (error: any): TErrorResponse => {
  const statusCode = 409
  const message = 'Duplicate Error'

  let extractKey = 'unknownKey'
  // let extractValue = 'unknownValue'

  const keyMatch = error.message.match(/dup key: \{ (\w+):/)
  // const valueMatch = error.message.match(/"([^"]+)"/)

  if (keyMatch && keyMatch.length > 1) {
    extractKey = keyMatch[1]
  }

  // if (valueMatch && valueMatch.length > 1) {
  //   extractValue = valueMatch[1]
  // }

  const errorMessage = `${extractKey} already exists!`

  return {
    statusCode,
    message,
    errorMessage,
    errorDetails: error,
    stack: error.stack,
  }
}
