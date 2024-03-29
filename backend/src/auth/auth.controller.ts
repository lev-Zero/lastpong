import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { Response } from 'express';
import { Auth42AuthGuard } from './security/auth.guard';
import { Request } from 'src/user/interface/user.interface';
import { JwtAuthGuard } from './security/jwt.guard';
import { Auth42Service } from 'src/auth/service/auth42.service';
import { UserService } from 'src/user/service/user.service';
import { userStatus } from 'src/user/enum/status.enum';
import { Sanitizer } from 'class-sanitizer';
import { CodeDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auth42Service: Auth42Service,
    private readonly userService: UserService,
  ) {}

  /*----------------------------------
	|								login							 |
	|								loginout					 |
	----------------------------------*/

  @Get('/')
  viaPath(@Res({ passthrough: true }) res: Response): void | HttpException {
    try {
      res.status(301).redirect(process.env.CALLBACK_URI);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  /*
	Auth42AuthGuard -> Auth42Strategy -> FtauthGuard ->
	*/
  @Get('/42/callback')
  @UseGuards(Auth42AuthGuard)
  async redirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void | HttpException> {
    try {
      if (req.user) {
        const data = await this.auth42Service.login(req.user);

        res.cookie('accessToken', data.token);
        res.cookie('profileUrl', data.profileUrl);
        res.cookie('otpStatus', data.otpStatus);
        res.cookie('accessToken42', data.accessToken42);
        await this.userService.updateStatus(req.user.userId, userStatus.ONLINE);

        res.status(301).redirect(`${process.env.FRONTEND_URL}/auth/login/otp`);
      } else {
        res.status(301).redirect(process.env.FRONTEND_URL);
      }
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<HttpException | string> {
    try {
      res.cookie('accessToken', '', {
        maxAge: 0,
      });
      await this.userService.updateStatus(req.user.userId, userStatus.OFFLINE);
      return JSON.stringify({ status: 'logout' });
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  /*----------------------------------
	|								OTP								 |
	----------------------------------*/

  @Get('/login/otp/check')
  async loginOTPCheck(@Req() req: Request): Promise<string | HttpException> {
    try {
      let token;
      if (req.headers.authorization)
        token = req.headers.authorization.split(' ')[1];
      else
        throw new HttpException(
          '토큰을 찾을 수 없습니다.',
          HttpStatus.BAD_REQUEST,
        );

      const payload = await this.authService.verifyJWT(token);

      if (payload.auth42Status) {
        const auth42 = await this.auth42Service
          .findAuth42ById(payload.id)
          .catch(() => null);
        if (!auth42)
          throw new HttpException(
            'AUTH42를 찾을 수 없습니다',
            HttpStatus.BAD_REQUEST,
          );

        if (auth42.otpOn === false) {
          return JSON.stringify({ status: 'otpOff' });
        } else {
          const qrcodeImg = await this.auth42Service.create42QRCode(payload.id);

          return qrcodeImg;
        }
      } else {
        throw new HttpException(
          'AUTH42가 유효하지 않습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/login/otp')
  async loginOTP(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: CodeDto,
  ): Promise<string | HttpException> {
    try {
      let token;
      if (req.headers.authorization) {
        token = req.headers.authorization.split(' ')[1];
      } else
        throw new HttpException(
          '토큰을 찾을 수 없습니다.',
          HttpStatus.BAD_REQUEST,
        );

      const payload = await this.authService.verifyJWT(token);

      const auth42 = await this.auth42Service
        .findAuth42ById(payload.id)
        .catch(() => null);
      if (!auth42)
        throw new HttpException(
          'Auth42을 찾을 수 없습니다.',
          HttpStatus.BAD_REQUEST,
        );

      if (payload.auth42Status) {
        const codeData = this.authSanitizer(body.code);
        const newToken = await this.auth42Service.loginOTP(payload, codeData);

        res.cookie('accessToken', newToken);
        await this.userService.updateStatus(payload.id, userStatus.ONLINE);
        return JSON.stringify({ token: newToken });
      } else {
        throw new HttpException(
          'AUTH42가 유효하지 않습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('/otp/on')
  @UseGuards(JwtAuthGuard)
  updateOtpOn(@Req() req: Request): Promise<object> | HttpException {
    try {
      return this.auth42Service.updateOtpOn(req.user.userId);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('/otp/off')
  @UseGuards(JwtAuthGuard)
  updateOtpOff(@Req() req: Request): Promise<object> | HttpException {
    try {
      return this.auth42Service.updateOtpOff(req.user.userId);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  @Get('/otp')
  @UseGuards(JwtAuthGuard)
  async findOtpOn(@Req() req: Request): Promise<string | HttpException> {
    try {
      return JSON.stringify({
        otpOn: await this.auth42Service.findOtpOn(req.user.userId),
      });
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  private authSanitizer(data: string): string {
    try {
      const data1 = Sanitizer.blacklist(data, ' ');
      const data2 = Sanitizer.escape(data1);
      const data3 = Sanitizer.stripLow(data2, true);
      const data4 = Sanitizer.trim(data3, ' ');
      return data4;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
