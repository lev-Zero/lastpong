import { User } from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminUser } from './AdminUser.entity';
import { BannedUser } from './BannedUser.entity';
import { JoinedUser } from './JoinedUser.entity';
import { MutedUser } from './MutedUser.entity';

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column()
  status: number;

  @Column({ nullable: true })
  password: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn()
  owner: User;

  @OneToMany(() => AdminUser, (adminuser) => adminuser.chatRoom)
  adminUser: AdminUser[];

  @OneToMany(() => JoinedUser, (joinedUser) => joinedUser.chatRoom)
  joinedUser: JoinedUser[];

  @OneToMany(() => MutedUser, (mutedUser) => mutedUser.chatRoom)
  mutedUser: MutedUser[];

  @OneToMany(() => BannedUser, (bannedUser) => bannedUser.chatRoom)
  bannedUser: BannedUser[];
}
