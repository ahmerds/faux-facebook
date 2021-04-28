import path from "path"
import config from "../config"
import logger from "../utils/logger"
import { AddCommentDto, LikePostDto, PublishPostDto } from "./interface/post"
import { User } from "../entity/User"
import { Post } from "../entity/Post"
import { Comment } from "../entity/Comment"
import { Like } from "../entity/Like"

export class PostService {
  public static async publishPost(uid: string, value: PublishPostDto, file: any = null) {
    const user = await User.findOneOrFail({ uid: uid })

    try {
      let filePath
      if (file) {
        // Only allow images PNGs and JPGs to be specific
        if (!(file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg")) {
          throw new Error("File not supported")
        }

        const maxFileSize = 1024 * 1024 * 10 // 10MB
        if (file.size > maxFileSize) {
          throw new Error("File too large")
        }

        filePath = path.join('uploads', file.name)
        const uploadPath = path.join('public', filePath)
        await file.mv(uploadPath)
      }

      const post = new Post()
      post.post = value.post
      post.user = user
      if (filePath) {
        post.image = `${config.APP_DOMAIN}/${filePath}`
      }

      await post.save()
      const userDetails = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
      delete post.user
      return { ...post, owner: userDetails }
    } catch (err) {
      throw new Error(err);
    }
  }

  public static async fetchAll() {
    try {
      const posts = await Post.find({})
      return posts
    } catch (err) {
      throw new Error(err)
    }
  }

  public static async fetch(id: number, fetchComments: boolean) {
    try {
      let post
      post = fetchComments ? await Post.findOneOrFail({ id }, { relations: ["comments"]})
                : await Post.findOneOrFail({ id })
      return post
    } catch(err) {
      throw new Error(err)
    }
  }

  public static async update(id: number, uid: string, value: PublishPostDto) {
    try {
      const post = await Post.findOneOrFail({ id }, { relations: ["user"] })

      if (post.user.uid === uid) {
        post.post = value.post

        await post.save()
        return post
      } else {
        throw new Error("Unauthorized")
      }
    } catch(err) {
      throw new Error(err)
    }
  }

  public static async delete(id: number, uid: string) {
    try {
      const post = await Post.findOneOrFail({ id }, { relations: ["user"] })

      if (post.user.uid === uid) {
        await post.remove()
        return
      } else {
        throw new Error("Unauthorized")
      }
    } catch(err) {
      throw new Error(err)
    }
  }

  public static async fetchComments(id: number) {
    try {
      const post = await Post.findOneOrFail({ id }, { relations: ["comments"]})
      return post.comments
    } catch(err) {
      throw new Error(err)
    }
  }

  public static async fetchOwnerPosts(uid: string) {
    try {
      const user = await User.findOneOrFail({ uid })
      const posts = await Post.find({ user })
      return posts
    } catch (err) {
      throw new Error(err)
    }
  }

  public static async addComment(uid: string, value: AddCommentDto) {
    try {
      const user = await User.findOneOrFail({ uid: uid })
      const comment = new Comment()
      const post = await Post.findOneOrFail({ id: value.postId })
      comment.comment = value.comment
      comment.user = user
      comment.post = post
      await comment.save()

      const userDetails = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
      delete comment.user
      return { ...comment, owner: userDetails }
    } catch (err) {
      throw new Error(err);
    }
  }

  public static async deleteComment(id: number, uid: string) {
    try {
      const comment = await Comment.findOneOrFail({ id }, { relations: ["user"] })

      if (comment.user.uid === uid) {
        await comment.remove()
        return
      } else {
        throw new Error("Unauthorized")
      }
    } catch(err) {
      throw new Error(err)
    }
  }

  public static async likePost(uid: string, value: LikePostDto) {
    try {
      const user = await User.findOneOrFail({ uid })
      const post = await Post.findOneOrFail({ id: value.postId })
      
      if (value.liked) {
        // Like a post
        const like = new Like()
        like.user = user
        like.post = post
        // Here we increment the denormalized likes field on the posts table
        post.likes++
        await like.save()
        await post.save()
      } else {
        // Remove like
        const like = await Like.findOneOrFail({ post: post, user: user })
        // Decrement post
        post.likes--
        await post.save()
        await like.remove()
      }
    } catch(err) {
      throw new Error(err)
    }
  }
}