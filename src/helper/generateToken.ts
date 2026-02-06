/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'

export const generateToken = (payLoad: JwtPayload, secret: string, expiresIn: string) => {
  const accessToken = jwt.sign(payLoad, secret, {
    expiresIn: expiresIn,
  } as SignOptions)
  return accessToken
}
