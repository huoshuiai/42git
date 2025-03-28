import dotenv from "dotenv";

dotenv.config()

export const REDIS_URL = process.env.REDIS_URL
export const PORT = process.env.PORT 
export const MAIN_ORIGIN = process.env.MAIN_ORIGIN
export const SESSION_SECRET = process.env.SESSION_SECRET  as string