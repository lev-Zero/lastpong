import { User } from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JoinedDmUser } from './JoinedDmUser.entity';

@Entity()
export class ChatRoomDm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column()
  status: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn()
  owner: User;

  @OneToMany(() => JoinedDmUser, (joinedDmUser) => joinedDmUser.chatRoomDm)
  joinedDmUser: JoinedDmUser[];
}
