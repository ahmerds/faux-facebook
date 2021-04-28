import {
	Entity, 
	BaseEntity, 
	PrimaryGeneratedColumn, 
	Column, 
	CreateDateColumn, 
	UpdateDateColumn,
	ManyToOne,
} from "typeorm"
import { User } from "./User"
import { Post } from './Post'

@Entity()
export class Comment extends BaseEntity {

	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	user: User

	@Column()
	comment: string

	@ManyToOne(() => Post, { onDelete: 'CASCADE' })
	post: Post

	@CreateDateColumn()
	created_at: Date

	@UpdateDateColumn()
	updated_at: Date
}
