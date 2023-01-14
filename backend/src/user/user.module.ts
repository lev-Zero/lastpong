import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avatar } from './entity/avatar.entity';
import { Block } from './entity/block.entity';
import { Friend } from './entity/friend.entity';
import { Match } from './entity/match.entity';
import { User } from './entity/user.entity';
import { UserController } from './user.controller';
import { UserService } from './service/user.service';
import { AvatarService } from './service/avatar.service';
import { BlockService } from './service/block.service';

import { FriendService } from './service/friend.service';
import { MatchService } from './service/match.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Avatar, Match, Block, Friend]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    AvatarService,
    BlockService,
    FriendService,
    MatchService,
  ],
  exports: [
    UserService,
    AvatarService,
    BlockService,
    FriendService,
    MatchService,
  ],
})
export class UserModule {}
