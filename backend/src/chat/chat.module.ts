import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entity/chatRoom.entity';
import { ChatRoomDm } from './entity/chatRoomDm.entity';
import { BannedUser } from './entity/BannedUser.entity';
import { AdminUser } from './entity/AdminUser.entity';
import { JoinedUser } from './entity/JoinedUser.entity';
import { MutedUser } from './entity/MutedUser.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { JoinedDmUser } from './entity/JoinedDmUser.entity';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRoom,
      ChatRoomDm,
      BannedUser,
      AdminUser,
      JoinedUser,
      MutedUser,
      JoinedDmUser,
    ]),
    AuthModule,
    UserModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
