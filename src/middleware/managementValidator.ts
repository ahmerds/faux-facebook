import {Request, Response, NextFunction} from "express"
import Joi from "joi";
import logger from "../utils/logger"

export async function updateInfo(req: Request, res: Response, next: NextFunction) {
	const schema = Joi.object({
		uid: Joi.string().required(),
		data: Joi.object({
			firstName: Joi.string().trim(),
			lastName: Joi.string().trim()
		}).required()
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

export async function revokeRefreshToken(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object({
		uid: Joi.string().required()
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

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object({
		uid: Joi.string().required(),
		oldPassword: Joi.string().required(),
		newPassword: Joi.string().min(6).required()
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

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object({
		email: Joi.string().email().required()
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

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object({
		email: Joi.string().email().required(),
		code: Joi.string().required(),
		password: Joi.string().min(6).required()
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

export async function checkResetLink(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object({
		email: Joi.string().required(),
		code: Joi.string().required()
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

export async function disableAccount(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object({
		uid: Joi.string().required(),
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