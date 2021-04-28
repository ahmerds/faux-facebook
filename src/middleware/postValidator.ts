import {Request, Response, NextFunction} from "express"
import Joi from "joi";
import logger from "../utils/logger"

export async function publishPost(req: Request, res: Response, next: NextFunction) {
	const schema = Joi.object({
		post: Joi.string().required()
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

export async function getPost(req: Request, res: Response, next: NextFunction) {
	const schema = Joi.object({
		id: Joi.number().required()
	})

	try {
		await schema.validateAsync(req.params)
		next()
	} catch (err) {
		logger.error(err);
		return res.status(400).json({
			error: true,
			message: "Invalid input parameters"
		})
	}
}

export async function updatePost(req: Request, res: Response, next: NextFunction) {
	const schema = Joi.object({
		id: Joi.number().required()
	})
	const body = Joi.object({
		post: Joi.string().required()
	})

	try {
		await schema.validateAsync(req.params)
		await body.validateAsync(req.body)
		next()
	} catch (err) {
		logger.error(err);
		return res.status(400).json({
			error: true,
			message: "Invalid input parameters"
		})
	}
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
	const schema = Joi.object({
		id: Joi.number().required()
	})

	try {
		await schema.validateAsync(req.params)
		next()
	} catch (err) {
		logger.error(err);
		return res.status(400).json({
			error: true,
			message: "Invalid input parameters"
		})
	}
}

export async function addComment(req: Request, res: Response, next: NextFunction) {
	const schema = Joi.object({
		postId: Joi.number().required(),
		comment: Joi.string().required()
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

export async function likePost(req: Request, res: Response, next: NextFunction) {
	const schema = Joi.object({
		postId: Joi.number().required(),
		liked: Joi.boolean().required()
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
