import {
	Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Profile {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({nullable:true})
	filename: string;

	@Column({ type: 'bytea', nullable:true })
	photoData: Buffer;

	@OneToOne(() => User,(user)=>user.profile, { onDelete: 'CASCADE' })
	user: User;
}
