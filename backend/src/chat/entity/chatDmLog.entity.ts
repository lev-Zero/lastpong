import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatRoomDm } from './chatRoomDm.entity';

@Entity()
export class ChatDmLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => ChatRoomDm, (chatroom) => chatroom.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  chatRoomDm: ChatRoomDm;

  @ManyToOne(() => User, (user) => user.id, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;
}
