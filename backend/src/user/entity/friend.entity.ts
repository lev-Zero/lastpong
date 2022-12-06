import {
	Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Friend {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.id, {  onDelete: 'CASCADE' })
	@JoinColumn()
	friendOfferUser: User;

	@ManyToOne(() => User, (user) => user.id, { eager: true, onDelete: 'CASCADE' })
	@JoinColumn()
	friend: User;

}
