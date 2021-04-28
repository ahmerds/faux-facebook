import {
	Entity, 
	BaseEntity, 
	PrimaryGeneratedColumn,
	CreateDateColumn, 
	UpdateDateColumn,
	ManyToOne,
} from "typeorm"
import { User } from "./User"
import { Post } from './Post'

@Entity()
export class Like extends BaseEntity {

	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne(() => User)
	user: User

	@ManyToOne(() => Post)
	post: Post

	@CreateDateColumn()
	created_at: Date

	@UpdateDateColumn()
	updated_at: Date
}
