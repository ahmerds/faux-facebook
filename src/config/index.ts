/**
 * App wide configuration, import this file anywhere environment variables are required
 */

import "reflect-metadata"
import * as dotenv from "dotenv"
import { createTransport } from "nodemailer"
import redis from "redis"

dotenv.config()

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST, // Uncomment this if using docker
    port: parseInt(process.env.REDIS_PORT)
})

const smtp = {
    HOST: process.env.SMTP_HOST,
    PORT: process.env.SMTP_PORT,
    USERNAME: process.env.SMTP_USERNAME,
    PASSWORD: process.env.SMTP_PASSWORD
}

const transport = createTransport({
    host: smtp.HOST,
    port: parseInt(smtp.PORT),
    auth: {
        user: smtp.USERNAME,
        pass: smtp.PASSWORD
    }
})

export default {
    NODE_ENV: process.env.NODE_ENV,
    APP_NAME: process.env.APP_NAME,
    SERVICE_NAME: process.env.SERVICE_NAME,
    PORT: process.env.PORT,
    APP_DOMAIN: process.env.APP_DOMAIN,
    SIGNING_KEY: {
        ACCESS: process.env.ACCESS_SIGNING_KEY,
        REFRESH: process.env.REFRESH_SIGNING_KEY,
    },
    SMTP: {
        options: smtp,
        transporter: transport
    },
    REDIS_CLIENT: redisClient
}
