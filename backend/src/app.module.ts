import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { Auth42 } from './auth/entity/auth42.entity';
import { Avatar } from './user/entity/avatar.entity';
import { Block } from './user/entity/block.entity';
import { Friend } from './user/entity/friend.entity';
import { Match } from './user/entity/match.entity';
import { User } from './user/entity/user.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule,UserModule,
    ConfigModule.forRoot({isGlobal:true}),
    TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'postgres',
    port: 5432,
    username: 'transcendence',
    password: 'transcendence',
    database: 'chat_pong',
    entities: [
      User,
      Avatar,
      Match,
      Block,
      Friend,
      Auth42
    ],
    autoLoadEntities:true, //entity 자동 불러옴 (default:false)
    logging:true, //query확인가능 (default:false)
    synchronize: true, //프로그램 시작때마다 DB스키마 자동생성 및 테이블 수정사항 반영(default:false)
    } )	],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
