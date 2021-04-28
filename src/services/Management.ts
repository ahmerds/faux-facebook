import * as argon2 from "argon2"
import crypto from "crypto"

import config from "../config"

import { User } from "../entity/User"
import sendEmail from "../utils/sendEmail"
import logger from "../utils/logger"

import { ChangePasswordDto, DisableAccountDto, ResetPasswordDto, UpdateInfoDto, CheckLinkDto } from "./interface/management"

interface UpdateData {
    firstName?: string
    lastName?: string
}

export class ManagementService {
    constructor() {}

    /**
     * This should only be called by an authenticated user
     * 
     * @param uid 
     */
    public static async revokeRefreshToken(uid: string) {
        // Revoking refresh token implies logging the user out of all sessions and deleting the key
        // On the frontend, dev should delete accessToken so user has no access even before token expires
        config.REDIS_CLIENT.del(`refreshToken_${uid}`)
        return true
    }

    /**
     * This is a protected link
     * Should only be called after a user has been authenticated
     * 
     * @param email 
     * @param data 
     */
    public static async updateInfo(value: UpdateInfoDto) {
        const user = await User.findOne({ uid: value.uid })
        
        // Currently users cannot change the email they used to sign up
        // We check for the provided data and update based on that
        user.firstName = !!value.data.firstName ? value.data.firstName : user.firstName
        user.lastName = !!value.data.lastName ? value.data.lastName : user.lastName
        await user.save()

        return value.data
    }

    /**
     * This is a protected link
     * Should only be called after a user has been authenticated
     * 
     * @param email 
     * @param oldPassword 
     * @param newPassword 
     */
    public static async changePassword(value: ChangePasswordDto) {
        const user = await User.findOne({ uid: value.uid })
        if(!user) throw new Error("No such user")

        const saltPass = user.salt + value.oldPassword
        const isPasswordCorrect = await argon2.verify(user.password, saltPass)
        if(!isPasswordCorrect) throw new Error("Incorrect password")

        const passwordHashed = await argon2.hash(user.salt + value.newPassword)
        user.password = passwordHashed

        // Uncomment code below if you want to revoke token when password is changed
        // this.revokeRefreshToken(user.uid);

        await user.save()

        return true
    }

    /**
     * Called when a user forgets their password and wants to request for a reset
     * 
     * @param email
     */
    public static async forgotPassword(email: string) {
        // Check if the user is registered before sending an email
        const user = await User.findOne({ email: email })
        if(!user) throw new Error("No such user")

        const randCode = crypto.randomBytes(30).toString("hex")

        config.REDIS_CLIENT.setex(`resetpass_${email}`, 60*60*2, randCode) // Expires after 2 hours

        const link = `${config.APP_DOMAIN}/resetlink?code=${randCode}&email=${email}`
        try {
            // Here we wait for the email to be sent before returning a result to the user
            await sendEmail("resetpass", {
                email: email,
                link
            })
            // console.log("Email sent")
        } catch(err) {
            logger.error(`Error sending reset email to ${email}: ${err}`)
            throw new Error(`Error sending reset email to ${email}: ${err}`)
        }

        return true
    }

    /**
     * Check if a link is valid before taking user to a page where they can reset their password
     * 
     * @param value 
     * @returns 
     */

    public static async checkResetLink(value: CheckLinkDto) {
        return new Promise((resolve, reject) => {
            const redisKey = `resetpass_${value.email}`

            config.REDIS_CLIENT.get(redisKey, async (err, redisCode) => {
                if(err) reject("Code invalid")
                if(redisCode && redisCode === value.code) {
                    resolve("Done")
                } else {
                    reject("Code invalid")
                }
            })
        })
    }

    /**
     * After the user receives the email, they can use the code to change their password
     * Get email and code from query part of link and pass it down in the request body
     * 
     * @param email Users email
     * @param code Code sent to email
     * @param password The new password entered
     */
    public static resetPassword(value: ResetPasswordDto) {
        return new Promise((resolve, reject) => {
            const redisKey = `resetpass_${value.email}`

            // Confirm key again
            config.REDIS_CLIENT.get(redisKey, async (err, redisCode) => {
                if(err) reject("Code invalid")
                if(redisCode && redisCode === value.code) {
                    const user = await User.findOne({ email: value.email })
                    const passwordHashed = await argon2.hash(user.salt + value.password)
                    user.password = passwordHashed 
                    await user.save()
                    
                    config.REDIS_CLIENT.del(redisKey)
                    resolve("Done")
                } else {
                    reject("Code invalid")
                }
            })
        })
    }

    /**
     * This is a protected service
     * Should only be called after a user has been authenticated
     * In order to comply with GDPRs right to be forgotten, users have the ability to completely delete their accounts
     * 
     * @param uid 
     * @param password Even though the user is authenticated, They will still be required to provide their password
     */
    public static async disableAccount(value: DisableAccountDto) {
        try {
            const user = await User.findOne({ uid: value.uid })

            const saltPass = user.salt + value.password
            const isPasswordCorrect = await argon2.verify(value.password, saltPass)
            if(!isPasswordCorrect) throw new Error("Incorrect password")

            user.isActive = false
            await user.save()
            // User.delete({ uid: uid })
        } catch(err) {
            throw new Error(err)
        }
        // TODO: Emit event that user has been deleted in case we have services that listen
    }
}