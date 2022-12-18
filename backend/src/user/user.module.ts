import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entity/profile.entity';
import { Block } from './entity/block.entity';
import { Auth42 } from '../auth/entity/auth42.entity';
import { Friend } from './entity/friend.entity';
import { Match } from './entity/match.entity';
import { User } from './entity/user.entity';
import { UserController } from './user.controller';
import { UserService } from './service/user.service';
import { ProfileService } from './service/profile.service';
import { BlockService } from './service/block.service';

import { FriendService } from './service/friend.service';
import { MatchService } from './service/match.service';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
	imports:[
		TypeOrmModule.forFeature([
			User,
			Profile,
			Match,
			Block,
			Friend
		]),
		JwtModule.register({
			secret: "SECRET_KEY",
			signOptions: { expiresIn: '1d' },
		})

	],
  controllers: [UserController],
	providers: [
		UserService, ProfileService, BlockService,  FriendService, MatchService
	],
	exports: [
		UserService, ProfileService, BlockService, FriendService, MatchService
	]
	})
export class UserModule {}
