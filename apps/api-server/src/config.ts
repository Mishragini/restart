import { config } from "dotenv"
config()

const PORT = process.env.PORT || 3000
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || ""
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || ""
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ""
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ""
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || ""
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || ""
const S3_BUCKET_REGION = process.env.S3_BUCKET_REGION || ""
const IAM_USER_ACCESS_KEY = process.env.IAM_USER_ACCESS_KEY || ""
const IAM_USER_SECRET_ACCESS_KEY = process.env.IAM_USER_SECRET_ACCESS_KEY || ""

export {
    PORT,
    BETTER_AUTH_SECRET,
    BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    FRONTEND_BASE_URL,
    S3_BUCKET_REGION,
    IAM_USER_ACCESS_KEY,
    IAM_USER_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME
}