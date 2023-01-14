import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Auth42 } from './auth/entity/auth42.entity';
import { Avatar } from './user/entity/avatar.entity';
import { Block } from './user/entity/block.entity';
import { Friend } from './user/entity/friend.entity';
import { Match } from './user/entity/match.entity';
import { User } from './user/entity/user.entity';
import { ChatModule } from './chat/chat.module';
import { ChatRoom } from './chat/entity/chatRoom.entity';
import { ChatRoomDm } from './chat/entity/chatRoomDm.entity';
import { BannedUser } from './chat/entity/BannedUser.entity';
import { AdminUser } from './chat/entity/AdminUser.entity';
import { JoinedUser } from './chat/entity/JoinedUser.entity';
import { MutedUser } from './chat/entity/MutedUser.entity';
import { JoinedDmUser } from './chat/entity/JoinedDmUser.entity';
import { GameModule } from './game/game.module';
import { ChatLog } from './chat/entity/chatLog.entity';
import { ChatDmLog } from './chat/entity/chatDmLog.entity';

@Module({
  imports: [
    ChatModule,
    GameModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      port: +process.env.POSTGRES_PORT,
      entities: [
        User,
        Avatar,
        Match,
        Block,
        Friend,
        Auth42,
        ChatRoom,
        ChatRoomDm,
        BannedUser,
        AdminUser,
        JoinedUser,
        MutedUser,
        JoinedDmUser,
        ChatLog,
        ChatDmLog,
      ],
      autoLoadEntities: true,
      synchronize: true,
    }),
    ChatModule,
    GameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
