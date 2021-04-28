import { promisify } from "util"
import * as argon2 from "argon2"
import crypto from "crypto"
import { v1 as uuid } from "uuid"
import moment from "moment"
import jwt, { SignOptions } from "jsonwebtoken"

import config from "../config"

import { User } from "../entity/User"
import sendEmail from "../utils/sendEmail"
import logger from "../utils/logger"

import { 
    TokenData, 
    RegisterDto,
    ConfirmEmailDto,
    LoginDto,
    RefreshTokenDto
} from './interface/auth'

export class AuthService {
    redisClient = config.REDIS_CLIENT
    constructor() {}

    public async register(data: RegisterDto) {
        const uid = uuid()
        const salt = this.generateSalt()
        
        try{
            const doesUserExist = await User.findOne({email: data.email})
            if(doesUserExist && doesUserExist.email === data.email) throw new Error("Username taken")

            const passwordHashed = await argon2.hash(salt + data.password)

            const user = new User()
            user.firstName = data.firstName.trim()
            user.lastName = data.lastName.trim()
            user.email = data.email.trim()
            user.password = passwordHashed
            user.isActive = true
            user.uid = uid
            user.salt = salt
            user.isUserConfirmed = false

            await user.save()
            // Dont call await here, so it runs without halting process
            this.sendConfirmationEmail(data.email.trim())

            // TODO: Emit event that a new user has been created. For additional services

            return { 
                email: data.email, 
                firstName: data.firstName, 
                lastName: data.lastName, 
                uid 
            }
        } catch(err) {
            throw new Error(err)
        }
    }

    // A private method to generate random cryptographically secured string
    private generateSalt() {
        return crypto.randomBytes(16).toString("hex")
    }

    // Used to send email when a new user is created
    private async sendConfirmationEmail(email: string) {
        // This method can be called to resend confirmation emails
        const uniqueCode = this.generateSalt()
        // Add uniqueCode to redis
        this.redisClient.setex(`confirmation_${email}`, 60*60*24, uniqueCode) // Unique Code Expires after 24 hours

        // Build link that will be sent in the confirmation email
        const link = `${config.APP_DOMAIN}/confirmemail?email=${email}&c=${uniqueCode}`
        try {
            await sendEmail("confirmation", {
                email: email,
                link
            })
        } catch(err) {
            logger.error(`Error sending confirmation email to ${email}: ${err}`)
            // Winston will catch this and add to exceptions log in production
            // throw new Error(`Error sending confirmation email to ${email}: ${err}`)
        }
    }

    public confirmEmail(value: ConfirmEmailDto) {
        return new Promise((resolve, reject) => {
            const redisKey = `confirmation_${value.email}`
            this.redisClient.get(redisKey, async (err, data) => {
                if(err) {
                    logger.error(`Redis error: ${err}`)
                    reject(`Redis error: ${err}`)
                }
        
                if(data) {
                    if(data === value.c) {
                        const user = await User.findOne({ email: value.email })
                        
                        user.isUserConfirmed = true
                        user.save().then(() => {
                            this.redisClient.del(redisKey, (err, reply) => {
                                // Do not return an error because this is not a crucial step
                                if(err) logger.error("Redis delete error: " + err)
                            })
                            // Delete the token from redis
                            resolve("User confirmed")
                        }).catch((err) => {
                            reject(`Could not save to DB: ${err}`)
                        })
                    } else{
                        reject("Code does not match")
                    }
                } else {
                    reject("Code has expired or does not exist")
                }
            })
        })
    }

    public async login(value: LoginDto) {
        const user = await User.findOne({email: value.email})
        if(!user || user === undefined) throw new Error("No such user")
        if(user.isActive === false) throw new Error("Account suspended")

        // Remove this line if you will like to allow login even without email confirmation
        // Added this because some services may like to support this feature
        if(user.isUserConfirmed === false) throw new Error("Email not confirmed") 
        
        const saltPass = user.salt + value.password
        const isPasswordCorrect = await argon2.verify(user.password, saltPass)
        // Manually separated password check, so different results can be returned depending on 
        // frontend requirements
        if(!isPasswordCorrect) throw new Error("Incorrect password")

        const userData = {
            uid: user.uid,
            email: user.email,
            lastName: user.lastName,
            firstName: user.firstName,
            isUserConfirmed: user.isUserConfirmed, // You can use this to determine how the client will handle unconfirmed users
            lastLogin: user.lastLogin
        }
        const accessToken = await this.generateJWT(userData, true)
        // In this case, only a single device is allowed to be signed in at a time
        // The code can easily be modified to allow multiple device sign in simply by returning an already existing refresh token, if any
        const refreshToken = await this.generateJWT(userData, false)
        // Add refresh token to Redis, this token expires after 7 days, can be modified to whatever length necessary
        this.redisClient.setex(`refreshToken_${userData.uid}`, 60*60*24*7, refreshToken)

        // Below is code snippet to allow multiple client sign in
        // Only one of the two can be used at a time
        // let rToken, refreshToken
        // try {
        //     const redisGet = promisify(this.redisClient.get)
        //     rToken = await redisGet(`refreshToken_${email}`)
        // } catch(err) {
        //     throw new Error(`Could not get from redis: ${err}`)
        // }

        // if(rToken) {
        //     // if there's a refresh token for that user, simply return it
        //     refreshToken = rToken
        // } else {
        //     // Otherwise generate a new refresh token and add it to redis
        //     refreshToken = await this.generateJWT(userData, false)
        //     this.redisClient.setex(`refreshToken_${email}`, 60*60*24*7, refreshToken)
        // }

        // Add access token to header with Bearer tag for every secured route
        const data = {
            accessToken,
            refreshToken,
            user: userData
        }

        const sqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        user.lastLogin = sqlTimestamp
        await user.save()

        return data
    }

    private generateJWT(data: TokenData, isAccessToken: boolean): Promise<string> {
        return new Promise((resolve, reject) => {
            // Refresh token expires after 7 days while access token expires after 12 hours
            // Refresh token should be used to exchange for a new access token on the frontend
            const expiresIn = isAccessToken ? 60*30*12 : 60*60*24*7 
            const options: SignOptions = {
                algorithm: "HS384",
                issuer: "Faux Facebook",
                subject: data.uid,
                audience: "auth",
                expiresIn
            }

            const SIGNING_KEY = isAccessToken ? config.SIGNING_KEY.ACCESS : config.SIGNING_KEY.REFRESH

            jwt.sign({ data }, SIGNING_KEY, options, (err, token) => {
                if(err) {
                    logger.error(err)
                    reject(err)
                }
                resolve(token)
            })
        })
    }

    public refreshAccessToken(value: RefreshTokenDto): Promise<string> {
        return new Promise((resolve, reject) => {
            // Before anything, check if the key is not in Redis
            // Reason may be because it was blacklisted, user info changed or it expired
            this.redisClient.get(`refreshToken_${value.uid}`, (err, token) => {
                if(err) return reject("No key " + err)
                if(value.refreshToken !== token) return reject("Token mismatch")

                // If key is found, verify and generate a new access token
                jwt.verify(value.refreshToken, config.SIGNING_KEY.REFRESH, {algorithms: ["HS384"]}, async (err, decoded: any) => {
                    if(err) return reject(`Error decoding: ${err}`)

                    const accessToken = await this.generateJWT(decoded.data, true)
                    resolve(accessToken)
                })
            })
        })
    }
}