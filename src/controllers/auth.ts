import { Request, Response } from "express"
import { AuthService } from "../services/Auth"
import logger from "../utils/logger"

// Initialize Auth Service once
const Auth = new AuthService()

/**
 * 
 * @param req 
 * @param res 
 */
export async function register(req: Request, res: Response) {
    try {
        const result = await Auth.register(req.body)
        logger.debug(`User: ${req.body.email} has been created`)

        res.json({
            message: "User created",
            data: result
        })
    } catch(err) {
        logger.error(String(err))
        if(String(err).includes("Username taken")) {
            return res.status(400).json({
                error: true,
                message: "Email is taken"
            })
        }
        res.status(500).json({
            error: true,
            message: "An internal server error has occurred"
        })
    }
}

/**
 * 
 * @param req 
 * @param res
 * 
 * Confirm user email 
 */
export async function confirmEmail(req: Request, res: Response) {
    const email = req.query.email
    const c = req.query.c 

    try {
        const confirmed = await Auth.confirmEmail({ email: email as string, c: c as string })

        res.json({
            isUserConfirmed: true,
            message: confirmed
        })
    } catch(err) {
        logger.error(`${err}`)
        if(String(err).includes("Code has expired") || String(err).includes("Code does not match")) {
            return res.status(400).json({
                isUserConfirmed: false,
                message: "Invalid token"
            })
        }
        res.status(500).json({
            error: true,
            message: "An internal server error has occurred"
        })
    }
}

export async function login(req: Request, res: Response) {
    try {
        const data = await Auth.login(req.body)
        res.json(data)
    } catch(err) {
        logger.error(`${err}`)
        if(String(err).includes("No such user") || String(err).includes("Incorrect password") 
            || String(err).includes("Account suspended") || String(err).includes("confirmed")) {
            return res.status(401).json({
                error: true,
                message: String(err)
            })
        } 
        res.status(500).json({
            error: true,
            message: "An internal server error has occurred"
        })
    }
}

/**
 * 
 * @param req 
 * @param res
 * 
 * Use this endpoint to exchange refresh token for a new access token
 */
export async function token(req: Request, res: Response) {
    try {
        const accessToken = await Auth.refreshAccessToken(req.body)
        res.json({
            accessToken,
            tokenType: "Bearer"
        })
    } catch(err) {
        logger.error(`${err}`)
        res.status(403).json({
            error: true,
            message: "An error occurred"
        })
    }
}