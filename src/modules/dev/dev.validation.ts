import {z} from 'zod'

import {USER_ROLE} from '@/modules/user/user.constant'

const loginAsRoleSchema = z.object({
  role: z.enum(Object.values(USER_ROLE) as [string, ...string[]]),
})

export const DevValidation = {
  loginAsRoleSchema,
}
