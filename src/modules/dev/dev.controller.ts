import httpStatus from 'http-status'

import config from '@/config'
import {USER_ROLE} from '@/modules/user/user.constant'
import {catchAsync} from '@/utils/catchAsync'
import {sendResponse} from '@/utils/sendResponse'

import {DevServices} from './dev.service'

const loginAsRole = catchAsync(async (req, res) => {
  if (config.node_env !== 'development') {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: 'This endpoint is only available in development mode',
      data: null,
    })
  }

  const {role} = req.body as {role: (typeof USER_ROLE)[keyof typeof USER_ROLE]}
  const result = await DevServices.loginAsRoleFromDatabase(role)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Logged in as ${role} successfully`,
    data: result,
  })
})

export const DevControllers = {
  loginAsRole,
}
