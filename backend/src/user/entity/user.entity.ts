import {
	Column,
	Entity,
	OneToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	JoinColumn,
} from 'typeorm';
import { Avatar } from './avatar.entity';
import { userStatus } from '../enum/status.enum';
import { Match } from './match.entity';
import { Auth42 } from '../../auth/entity/auth42.entity';
import { Friend } from './friend.entity';
import { Block } from './block.entity';
import { AdminUser } from 'src/chat/entity/AdminUser.entity';
import { JoinedUser } from 'src/chat/entity/JoinedUser.entity';
import { MutedUser } from 'src/chat/entity/MutedUser.entity';
import { BannedUser } from 'src/chat/entity/BannedUser.entity';

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => Auth42, (auth42) => auth42.user)
	@JoinColumn()
	auth42: Auth42;

	@OneToOne(() => Avatar, (avatar) => avatar.user)
	@JoinColumn()
	avatar: Avatar;

	@Column({ unique: true, nullable: true })
	username: string;

	@Column({ default: 100 })
	rating: number;

	@OneToMany(() => Friend, (friend) => friend.friendOfferUser)
	friendOfferUser: Friend;
	@OneToMany(() => Friend, (friend) => friend.friend)
	friend: Friend;

	@OneToMany(() => Block, (block) => block.blockOfferUser)
	blockOfferUser: Block[];
	@OneToMany(() => Block, (block) => block.blockedUser)
	block: Block;

	@Column({ default: userStatus.OFFLINE })
	status: userStatus;

	@OneToMany(() => Match, (match) => match.winner)
	winner: Match;

	@OneToMany(() => Match, (match) => match.loser)
	loser: Match;

	@Column({ default: null })
	token: string;

	@OneToMany(() => AdminUser, (adminuser) => adminuser.user)
	adminUser: AdminUser;

	@OneToMany(() => JoinedUser, (joinedUser) => joinedUser.user)
	joinedUser: JoinedUser;

	@OneToMany(() => MutedUser, (mutedUser) => mutedUser.user)
	mutedUser: MutedUser;

	@OneToMany(() => BannedUser, (bannedUser) => bannedUser.user)
	bannedUser: AdminUser;


}
