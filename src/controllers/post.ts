import { Request, Response } from "express"
import { PostService } from "../services/Post"
import logger from "../utils/logger"

export async function publish(req: Request, res: Response) {
    try {
        let file = req.files && req.files.postfile ? req.files.postfile : null
        
        const newPost = await PostService.publishPost(req.user.uid, req.body, file)
        res.json({
            message: "Post created",
            data: newPost
        })
    } catch(err) {
        logger.error(`Error in postController: ${err}`)
        if(String(err).includes("not supported")) {
            return res.status(403).json({
                error: true,
                message: "The file you tried to upload is not supported"
            })
        } else if(String(err).includes("too large")) {
            return res.status(403).json({
                error: true,
                message: "The file you tried to upload is too large"
            })
        }
        res.status(500).json({
            error: true,
            message: "Could not create new post due to an unknown error"
        })
    }
}

export async function fetch(req: Request, res: Response) {
    try {
        const posts = await PostService.fetchAll()
        res.json({
            message: "Posts found",
            data: posts
        })
    } catch (err) {
        logger.error(`Error in postController: ${err}`)
        res.status(500).json({
            error: true,
            message: "Could not fetch posts"
        })
    }
}

export async function getPost(req: Request, res: Response) {
    try {
        let fetchComments = false
        if (req.query.comments && (req.query.comments !== "false")) {
            fetchComments = true
        }
        const id: number = Number(req.params.id)
        const post = await PostService.fetch(id, fetchComments)
        res.json({
            message: "Post found",
            data: post
        })
    } catch (err) {
        logger.error(`Error in postController: ${err}`)
        if(String(err).includes("EntityNotFound")) {
            return res.status(404).json({
                error: true,
                message: "Post not found"
            })
        }
        res.status(500).json({
            error: true,
            message: "Could not fetch post"
        })
    }
}

export async function updatePost(req: Request, res: Response) {
    try {
        const id: number = Number(req.params.id)
        const post = await PostService.update(id, req.user.uid, req.body)
        res.json({
            message: "Post Updated",
            data: post
        })
    } catch (err) {
        logger.error(`Error in postController: ${err}`)
        res.status(500).json({
            error: true,
            message: "Post could not be updated"
        })
    }
}

export async function deletePost(req: Request, res: Response) {
    try {
        const id: number = Number(req.params.id)
        await PostService.delete(id, req.user.uid)
        res.json({
            message: "Post Deleted"
        })
    } catch (err) {
        logger.error(`Error in postController: ${err}`)
        if(String(err).includes("Unauthorized")) {
            return res.status(403).json({
                error: true,
                message: "You are not allowed to carry out this action"
            })
        }
        res.status(500).json({
            error: true,
            message: "Post could not be deleted"
        })
    }
}

export async function fetchComments(req: Request, res: Response) {
    try {
        const id: number = Number(req.params.id)
        const posts = await PostService.fetchComments(id)
        res.json({
            message: "Comments found",
            data: posts
        })
    } catch (err) {
        logger.error(`Error in postController: ${err}`)
        res.status(500).json({
            error: true,
            message: "Could not fetch comments for this post"
        })
    }
}

export async function fetchOwnerPosts(req: Request, res: Response) {
    try {
        const posts = await PostService.fetchOwnerPosts(req.user.uid)
        res.json({
            message: "Posts found",
            data: posts
        })
    } catch (err) {
        logger.error(`Error in postController: ${err}`)
        res.status(500).json({
            error: true,
            message: "Could not fetch posts"
        })
    }
}

export async function addComment(req: Request, res: Response) {
    try {
        const newPost = await PostService.addComment(req.user.uid, req.body)
        res.json({
            message: "Comment added successfully",
            data: newPost
        })
    } catch(err) {
        logger.error(String(err))
        res.status(500).json({
            error: true,
            message: "Could not create a new comment"
        })
    }
}

export async function deleteComment(req: Request, res: Response) {
    try {
        const id: number = Number(req.params.id)
        await PostService.deleteComment(id, req.user.uid)
        res.json({
            message: "Comment Deleted"
        })
    } catch (err) {
        logger.error(`Error in postController: ${err}`)
        if(String(err).includes("Unauthorized")) {
            return res.status(403).json({
                error: true,
                message: "You are not allowed to carry out this action"
            })
        }
        res.status(500).json({
            error: true,
            message: "Comment could not be deleted"
        })
    }
}

export async function likePost(req: Request, res: Response) {
    try {
        await PostService.likePost(req.user.uid, req.body)
        const msg = req.body.liked ? "Post liked" : "Like removed"
        res.json({
            message: msg
        })
    } catch(err) {
        if(String(err).includes("EntityNotFound")) {
            return res.status(400).json({
                error: true,
                message: "You cannot unlike a post you have not liked"
            })
        }
        logger.error(String(err))
        res.status(500).json({
            error: true,
            message: "An error occurred"
        })
    }
}
