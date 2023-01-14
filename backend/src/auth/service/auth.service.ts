import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { Payload } from '../interface/payload.interface';
import { UserService } from 'src/user/service/user.service';
import { JwtService } from '@nestjs/jwt';
import { Auth42 } from '../entity/auth42.entity';
import { Socket } from 'socket.io';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(Auth42)
    private readonly auth42Repository: Repository<Auth42>,
  ) {}

  /*----------------------------------
	|								jwt								 |
	----------------------------------*/

  async generateJWT(
    userId: number,
    auth42Status: boolean,
    otpStatus: boolean,
  ): Promise<string> {
    try {
      const user = await this.userService.findUserById(userId);

      const payload: Payload = {
        id: user.id,
        username: user.username,
        auth42Status,
        otpStatus,
      };

      const token = await this.jwtService.sign(payload);
      this.userService.updateUserToken(userId, token);
      return token;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  verifyJWT(token: string): Payload {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new HttpException(
        '토큰이 유효하지 않습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // /*----------------------------------
  // |								socket						|
  // ----------------------------------*/

  async findUserByRequestToken(socket: Socket): Promise<User> {
    try {
      const authorization = socket.handshake.headers.authorization;

      const token = authorization && authorization.split(' ')[0];

      if (!token)
        throw new HttpException(
          '토큰을 찾을 수 없습니다.',
          HttpStatus.BAD_REQUEST,
        );
      const payload = this.verifyJWT(token);
      if (!payload) return null;
      if (payload.auth42Status === false || payload.otpStatus === false)
        return null;

      const user = await this.userService
        .findUserById(payload.id)
        .catch(() => null);
      if (!user) return null;
      return user;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
