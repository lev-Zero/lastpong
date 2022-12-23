import { User } from 'src/user/entity/user.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChatRoom } from './chatRoom.entity';

@Entity()
export class JoinedUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChatRoom, (chatroom) => chatroom.id, { onDelete: 'CASCADE' })
  @JoinColumn()
  chatRoom: ChatRoom;

  @ManyToOne(() => User, (user) => user.id, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;
}
