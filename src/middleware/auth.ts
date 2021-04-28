import {Request, Response, NextFunction} from "express"
import jwt from 'jsonwebtoken'

import logger from "../utils/logger"
import config from "../config"

// Use this middleware to protect routes
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const bearerToken = req.headers['authorization']
  if (!bearerToken) {
    return res.status(401).json({
      message: 'Unauthorized. Please log in'
    })
  }

  // Get token from header value
  const token = (String(bearerToken).split(' '))[1]

  try {
    const decoded: any = jwt.verify(token, config.SIGNING_KEY.ACCESS, {algorithms: ["HS384"]})
    if (decoded) {
      req.user = decoded.data
      next()
    }
  } catch (err) {
    // Token may have expired. If this is the case, exchange refresh token for a new access token using the token endpoint
    return res.status(401).json({
      message: 'Unauthorized. Please log in',
      error: String(err)
    })
  }
}