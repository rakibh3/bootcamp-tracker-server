import { Router } from 'express'
import { OTPRoute } from '@/modules/otp/otp.route'
import { UserRoute } from '@/modules/user/user.route'

const router = Router()

// Mounting all module routes
router.use(OTPRoute)
router.use(UserRoute)

export default router
