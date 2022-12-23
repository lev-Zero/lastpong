import { User } from 'src/user/entity/user.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChatRoomDm } from './chatRoomDm.entity';

@Entity()
export class JoinedDmUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChatRoomDm, (chatroomdm) => chatroomdm.id, {
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
