import {Request, Response, NextFunction} from "express"
import Joi from "joi";
import logger from "../utils/logger"

export async function register(req: Request, res: Response, next: NextFunction) {
	const schema = Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().min(6).required(),
		firstName: Joi.string().max(50).required(),
		lastName: Joi.string().max(50).required()
	})

	try {
		await schema.validateAsync(req.body)
		next()
	} catch (err) {
		logger.error(err);
		return res.status(400).json({
			error: true,
			message: "Invalid input parameters"
		})
	}
}

export async function confirmEmail(req: Request, res: Response, next: NextFunction) {
	const schema = Joi.object({
		email: Joi.string().email().required(),
		c: Joi.string().min(16).required()
	})

  try {
		await schema.validateAsync(req.query)
		next()
	} catch (err) {
		logger.error(err);
		return res.status(400).json({
			error: true,
			message: "Invalid input parameters"
		})
	}
}

export async function login(req: Request, res: Response, next: NextFunction) {
	const schema = Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().required()
	})
  
	try {
		await schema.validateAsync(req.body)
		next()
	} catch (err) {
		logger.error(err);
		return res.status(400).json({
			error: true,
			message: "Invalid input parameters"
		})
	}
}

export async function token(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object({
		uid: Joi.string().required(),
		refreshToken: Joi.string().required(),
	})

	try {
		await schema.validateAsync(req.body)
		next()
	} catch (err) {
		logger.error(err);
		return res.status(400).json({
			error: true,
			message: "Invalid input parameters"
		})
	}
}