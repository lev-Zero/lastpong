import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Avatar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  filename: string;

  @Column({ type: 'bytea', nullable: true })
  photoData: Buffer;

  @OneToOne(() => User, (user) => user.avatar, { onDelete: 'CASCADE' })
  user: User;

  @Column({ nullable: true })
  profileUrl: string;
}
