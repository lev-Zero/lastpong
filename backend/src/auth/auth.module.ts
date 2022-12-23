import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './service/auth.service';
import { Auth42Strategy } from './security/passport.42auth.strategy';
import { JwtStrategy } from './security/passport.jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth42 } from './entity/auth42.entity';
import { Auth42Service } from './service/auth42.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auth42]),
    JwtModule.register({
      // secret: "SECRET_KEY",
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    UserModule,
  ],

  controllers: [AuthController],
  providers: [AuthService, Auth42Service, Auth42Strategy, JwtStrategy],
  exports: [AuthService, Auth42Service],
})
export class AuthModule {}
