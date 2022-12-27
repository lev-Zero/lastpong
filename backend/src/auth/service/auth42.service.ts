import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { Auth42 } from '../entity/auth42.entity';
import { Payload } from '../interface/payload.interface';
import { generateSecret, verify } from '2fa-util';
import { AvatarService } from 'src/user/service/avatar.service';
import { AuthService } from './auth.service';

@Injectable()
export class Auth42Service {
  constructor(
    @InjectRepository(Auth42)
    private readonly auth42Repository: Repository<Auth42>,
    private userService: UserService,
    private authService: AuthService,
    private avatarService: AvatarService,
  ) {}

  /*----------------------------------
	|				42 AUTH LOGIN 						 |
	----------------------------------*/

  /*
	Auth42AuthGuard -> Auth42Strategy -> FtauthGuard -> authController.redirect -> authService.login
	*/
//원본
  // async login(data): Promise<any> {
  //   try {
  //     const findUser = await this.userService
  //       .findUserByName(data.username)
  //       .catch(() => null);

  //     if (!findUser) {
  //       const user = await this.userService.createUser(data);

  //       await this.createAuth42(user.id);

  //       if (data.profileUrl) {
  //         await this.avatarService.updateOrCreateAvatar(
  //           user.id,
  //           data.profileUrl,
  //           {
  //             originalname: `profilePhoto${user.id}`,
  //             buffer: null,
  //           } as Express.Multer.File,
  //         );
  //       }
  //     }

  //     const user = await this.userService.findUserByName(data.username, [
  //       'auth42',
  //     ]);

  //     const auth42Status = true;
  //     let otpStatus = false;

  //     if (findUser && user.auth42.otpOn == false) {
  //       otpStatus = true;
  //     }

  //     const result = {
  //       token: await this.authService.generateJWT(
  //         user.id,
  //         auth42Status,
  //         otpStatus,
  //       ),
  //       profileUrl: data.profileUrl,
  //       otpStatus,
  //       accessToken42: data.accessToken42,
  //     };
  //     return result;
  //   } catch (e) {
  //     throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

//테스트
  async login(data): Promise<any> {
    try {
      const findUser = await this.userService
        .findUserByName(data.username)
        .catch(() => null);

      if (!findUser) {
        const user = await this.userService.createUser(data);

        await this.createAuth42(user.id);

        if (data.profileUrl) {
          await this.avatarService.updateOrCreateAvatar(
            user.id,
            data.profileUrl,
            {
              originalname: `profilePhoto${user.id}`,
              buffer: null,
            } as Express.Multer.File,
          );
        }
      }

      const user = await this.userService.findUserByName(data.username, [
        'auth42',
      ]);

      const auth42Status = true;
      let otpStatus = true;

      if (findUser && user.auth42.otpOn == true) {
        otpStatus = false;
      }

      const result = {
        token: await this.authService.generateJWT(
          user.id,
          auth42Status,
          otpStatus,
        ),
        profileUrl: data.profileUrl,
        otpStatus,
        accessToken42: data.accessToken42,
      };
      return result;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  /*----------------------------------
	|								OTP								 |
	----------------------------------*/

  async createAuth42(userId: number): Promise<Auth42> {
    try {
      let auth42 = await this.findAuth42ById(userId).catch(() => null);

      if (auth42)
        throw new HttpException(
          '42AUTH 유저 이미 존재합니다.',
          HttpStatus.BAD_REQUEST,
        );

      auth42 = this.auth42Repository.create({
        user: { id: userId },
        userId,
      });

      await this.auth42Repository.save(auth42);
      return auth42;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAuth42ById(
    userId: number,
    relations = [] as string[],
  ): Promise<Auth42> {
    try {
      const user = await this.userService.findUserById(userId);

      const auth42 = await this.auth42Repository.findOne({
        where: { user },
        relations,
      });
      if (!auth42)
        throw new HttpException(
          'AUTH42를 찾을 수 없습니다.',
          HttpStatus.BAD_REQUEST,
        );

      return auth42;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async create42QRCode(userId: number): Promise<string> {
    try {
      const auth42 = await this.findAuth42ById(userId, ['user']);

      // if (auth42.otp)
      //   throw new HttpException(
      //     '이미 유저는 OTP 인증을 마쳤습니다.',
      //     HttpStatus.BAD_REQUEST,
      //   );

      const output = await generateSecret(auth42.user.username, 'jeonghwl');

      auth42.otp = output.secret;
      await this.auth42Repository.save(auth42);
      delete output.secret;
      return output;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async loginOTP(payload: Payload, code: string): Promise<string> {
    try {
      console.log('[auth42C] loginOTP');
      console.log(1);
      if (payload.otpStatus)
        throw new HttpException(
          '이미 로그인한 유저 입니다.',
          HttpStatus.BAD_REQUEST,
        );

      console.log(11);
      await this.verifyCode(payload.id, code);

      console.log(111);
      const auth42Status = true;
      const otpStatus = true;
      console.log(1111);
      return this.authService.generateJWT(payload.id, auth42Status, otpStatus);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async verifyCode(
    userId: number,
    code: string,
    secret?: string,
  ): Promise<void> {
    try {
      if (!secret) {
        const auth42 = await this.findAuth42ById(userId);
        secret = auth42.otp;
      }

      if (!secret)
        throw new HttpException(
          'QRcode secret이 없습니다.',
          HttpStatus.BAD_REQUEST,
        );

      const check = await verify(code, secret);
      if (!check)
        throw new HttpException(
          '잘못된 6자리 숫자 입력하셨습니다.',
          HttpStatus.BAD_REQUEST,
        );
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateOtpOn(userId: number) {
    try {
      const user = await this.userService.findUserById(userId, ['auth42']);
      const auth42User = await this.auth42Repository.findOne({
        where: { userId: user.id },
      });
      if (auth42User.otpOn == false) auth42User.otpOn = true;
      await this.auth42Repository.save(auth42User);
      const result = { status: 'otpOn' };
      return result;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateOtpOff(userId: number) {
    try {
      console.log('[auth42Service] updateOtpOff');
      const user = await this.userService.findUserById(userId, ['auth42']);
      const auth42User = await this.auth42Repository.findOne({
        where: { userId: user.id },
      });
      if (auth42User.otpOn == true) auth42User.otpOn = false;
      await this.auth42Repository.save(auth42User);
      const result = { status: 'otpOff' };
      return result;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
