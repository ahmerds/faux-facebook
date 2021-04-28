export interface PublishPostDto {
  post: string
}

export interface AddCommentDto {
  postId: number
  comment: string
}

export interface LikePostDto {
  postId: number
  liked: boolean
}