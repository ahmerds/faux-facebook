import { Request, Response } from "express"
import { ManagementService } from "../services/Management"
import logger from "../utils/logger"

export async function updateInfo(req: Request, res: Response) {
    try {
        const rData = await ManagementService.updateInfo(req.body)
        res.json({
            message: "Updated",
            data: rData
        })
    } catch(err) {
        logger.error(`Error on updateInfo controller: ${err}`)
        res.status(500).json({
            error: true,
            message: "An error occurred"
        })
    }
}

export async function revokeRefreshToken(req: Request, res: Response) {
    try {
        await ManagementService.revokeRefreshToken(req.body.uid) 
        res.json({
            message: "User logged out"
        })
    } catch(err) {
        logger.error(`Error on revokeRefreshToken controller: ${err}`)
        res.status(500).json({
            error: true,
            message: "An error occurred"
        })
    }
}

export async function changePassword(req: Request, res: Response) {
    try {
        await ManagementService.changePassword(req.body)
        res.json({
            message: "Password changed successfully"
        })
    } catch(err) {
        logger.error(`${err}`)
        if(String(err).includes("Incorrect password")) {
            return res.status(401).json({
                error: true,
                message: "Incorrect password entered"
            })
        } else if(String(err).includes("No such user")) {
            return res.status(400).json({
                error: true,
                message: "No such user"
            })
        }
        res.status(500).json({
            error: true,
            message: "An error occurred"
        })
    }
}

export async function forgotPassword(req: Request, res: Response) {
    try {   
        await ManagementService.forgotPassword(req.body.email)
        res.json({
            message: "Reset link sent"
        })
    } catch(err) {
        logger.error(`Error on forgotPassword controller: ${err}`)
        if(String(err).includes("No such user")) {
            return res.status(400).json({
                error: true,
                message: "No such user"
            })
        }
        res.status(500).json({
            error: true,
            message: "An error occurred"
        })
    }
}

export async function checkResetLink(req: Request, res: Response) {
    try {   
        await ManagementService.checkResetLink({ email: req.query.email as string, code: req.query.code as string })
        res.json({
            message: "Link Valid"
        })
    } catch(err) {
        logger.error(`Error on resetPassword controller: ${err}`)
        if(String(err).includes("Code invalid")) {
            return res.status(400).json({
                error: true,
                message: "Code invalid"
            })
        }
        res.status(500).json({
            error: true,
            message: "An error occurred"
        })
    }
}

export async function resetPassword(req: Request, res: Response) {
    try {   
        await ManagementService.resetPassword(req.body)
        res.json({
            message: "Password reset successful, user may now login"
        })
    } catch(err) {
        logger.error(`Error on resetPassword controller: ${err}`)
        if(String(err).includes("Code invalid")) {
            return res.status(400).json({
                error: true,
                message: "Code invalid"
            })
        }
        res.status(500).json({
            error: true,
            message: "An error occurred"
        })
    }
}

export async function disableAccount(req: Request, res: Response) {
    try {   
        await ManagementService.disableAccount(req.body)
        res.json({
            message: "User account disabled"
        })
    } catch(err) {
        logger.error(`Error on disableAccount controller: ${err}`)
        if(String(err).includes("Incorrect password")) {
            return res.status(401).json({
                error: true,
                message: "Incorrect password provided"
            })
        }
        res.status(500).json({
            error: true,
            message: "An error occurred"
        })
    }
}