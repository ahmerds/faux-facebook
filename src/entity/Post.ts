import {
	Entity, 
	BaseEntity, 
	PrimaryGeneratedColumn, 
	Column, 
	CreateDateColumn, 
	UpdateDateColumn,
	ManyToOne,
	OneToMany,
	JoinTable
} from "typeorm";
import { IsInt } from "class-validator"
import { User } from "./User"
import { Comment } from "./Comment"

@Entity()
export class Post extends BaseEntity {

	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	user: User

	@Column()
	post: string

	@OneToMany(() => Comment, comment => comment.post, {
		onDelete: 'CASCADE'
	})
	comments: Comment[]

	@Column({ default: 0 })
	@IsInt()
	likes: number

	@Column({ nullable: true })
	image: string // Path to image

	@CreateDateColumn()
	created_at: Date

	@UpdateDateColumn()
	updated_at: Date
}
