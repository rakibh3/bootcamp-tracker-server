import {NextFunction, Request, Response} from 'express'
import httpStatus from 'http-status'
import jwt, {JwtPayload} from 'jsonwebtoken'

import config from '@/config'
import {AppError, unauthorizedErrorResponse} from '@/error'
import {TUserRole} from '@/modules/user/user.interface'
import {User} from '@/modules/user/user.model'
import {catchAsync} from '@/utils'
import {getCache, setCache} from '@/utils/redisCache'

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    console.log('Token', authHeader)

    // Check if the authorization header is provided
    if (!authHeader) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'No token provided !')
    }

    // Check if the token follows Bearer scheme
    if (!authHeader.startsWith('Bearer ')) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token format. Expected: Bearer <token>')
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1]

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'No token provided !')
    }

    //  Check if the token is valid
    const decoded = jwt.verify(token, config.jwt_access_secret as string) as JwtPayload

    const {email, role} = decoded
    
    // Auth caching: Cache user lookup for 5 mins to reduce DB hits on high traffic routes
    const authCacheKey = `cache:auth:user:${email}`
    const cachedUser = await getCache<any>(authCacheKey)
    
    let user = cachedUser
    if (!user) {
      // checking if the user exists in DB
      user = await User.findOne({ email }).lean()
      if (user) {
        await setCache(authCacheKey, user, 300) // 5 minutes TTL
      }
    }

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
      res.status(httpStatus.UNAUTHORIZED).json(unauthorizedErrorResponse)
      return
    }

    req.user = decoded as JwtPayload
    next()
  })
}

export default auth
