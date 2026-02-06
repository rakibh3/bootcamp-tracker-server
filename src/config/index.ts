import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({path: path.join(process.cwd(), '.env')})

// Export config from environment
export default {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_ROUNDS,
  jwt_access_secret: process.env.JWT_SECRET,
  jwt_access_expires_in: process.env.JWT_EXPIRES_IN,
  stripe_secret_key: process.env.STRIP_SECRET_KEY,
}
