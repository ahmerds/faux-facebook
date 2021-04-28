import {Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from "typeorm";
import { IsEmail } from "class-validator"

@Entity()
export class User extends BaseEntity {

	@PrimaryGeneratedColumn()
	id: number

	@Column({ unique: true })
	uid: string

	@Column({ unique: true })
	@IsEmail()
	email: string

	@Column({ length: 128 })
	password: string

	@Column()
	isActive: boolean

	@Column()
	firstName: string

	@Column()
	lastName: string

	@Column()
	salt: string

	@Column()
	isUserConfirmed: boolean

	@Column("datetime", { nullable: true })
	lastLogin: string

	@CreateDateColumn()
	created_at: Date

	@UpdateDateColumn()
	updated_at: Date
}
