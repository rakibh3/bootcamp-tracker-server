import config from '@/config'
import {USER_ROLE} from '@/modules/user/user.constant'
import {User} from '@/modules/user/user.model'
import {generateToken} from '@/utils/generateToken'

const loginAsRoleFromDatabase = async (role: (typeof USER_ROLE)[keyof typeof USER_ROLE]) => {
  // Find a user with this role, or create a mock one
  let user = await User.findOne({role}).lean()

  if (!user) {
    // Create a mock user if none exists
    const mockEmail = `mock.${role.toLowerCase()}@example.com`
    // Ensure phone is unique by appending a role-based suffix
    const roles = Object.values(USER_ROLE)
    const roleIndex = roles.indexOf(role)
    const mockPhone = `0000000000${roleIndex}`.slice(-11)

    user = (
      await User.create({
        name: `Mock ${role}`,
        email: mockEmail,
        phone: mockPhone,
        role: role,
      })
    ).toObject()
  }

  const tokenPayload = {
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
  }

  const accessToken = generateToken(
    tokenPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  )

  return {
    accessToken,
    user: {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
    },
  }
}

export const DevServices = {
  loginAsRoleFromDatabase,
}
