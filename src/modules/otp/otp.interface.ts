export interface IOTPRequest {
  email: string
}

export interface IOTPVerify {
  email: string
  otp: string
}

export interface IOTPData {
  hashedOTP: string
  attempts: number
  resendCount: number
  lastResendAt: number
}

export interface IAuthResponse {
  accessToken: string
  user: {
    id: string
    email: string
    name?: string
  }
}
