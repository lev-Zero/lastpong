import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [GameController],
  providers: [GameService, GameGateway],
})
export class GameModule {}
