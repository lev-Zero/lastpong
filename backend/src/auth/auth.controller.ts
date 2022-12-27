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

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private auth42Service: Auth42Service,
    private userService: UserService,
  ) {}

  /*----------------------------------
	|								login							 |
	|								loginout					 |
	----------------------------------*/

  @Get('/')
  viaPath(@Res({ passthrough: true }) res: Response) {
    try {
      res.status(301).redirect('http://localhost:3000/auth/42/callback');
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
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
  ) {
    try {
      if (req.user) {
        const data = await this.auth42Service.login(req.user);

        res.cookie('accessToken', data.token);
        res.cookie('profileUrl', data.profileUrl);
        res.cookie('otpStatus', data.otpStatus);
        res.cookie('accessToken42', data.accessToken42);

        res.status(301).redirect('http://localhost:8080/auth/login/otp');
      } else {
        res.status(301).redirect('http://localhost:8080/auth/login');
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  // @Get('/logout')
  // @UseGuards(JwtAuthGuard)
  // logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  //   try {
  //     res.cookie('accessToken', '', {
  //       maxAge: 0,
  //     });
  //     res.send({ status: 'logout' }); //redirect
  //   } catch (e) {
  //     throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

  /*----------------------------------
	|								OTP								 |
	----------------------------------*/

  // //원본
  // @Get('/login/otp/check')
  // async loginOTPCheck(@Req() req: Request): Promise<string> {
  //   try {
  //     let token;
  //     if (req.headers.authorization)
  //       token = req.headers.authorization.split(' ')[1];
  //     else
  //       throw new HttpException(
  //         '토큰을 찾을 수 없습니다.',
  //         HttpStatus.BAD_REQUEST,
  //       );

  //     const payload = await this.authService.verifyJWT(token);

  //     if (payload.auth42Status) {
  //       const auth42 = await this.auth42Service
  //         .findAuth42ById(payload.id)
  //         .catch(() => null);
  //       if (!auth42)
  //         throw new HttpException(
  //           'AUTH42를 찾을 수 없습니다',
  //           HttpStatus.BAD_REQUEST,
  //         );

  //       // if (!auth42.otp) {
  //       const qrcodeImg = await this.auth42Service.create42QRCode(payload.id);

  //       return qrcodeImg;
  //       // } else {
  //       // 	return 'Write OTP Code'
  //       // }
  //     } else {
  //       throw new HttpException(
  //         'AUTH42가 유효하지 않습니다.',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //   } catch (e) {
  //     throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

//테스트
@Get('/login/otp/check')
async loginOTPCheck(@Req() req: Request): Promise<string> {
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
      
      if(auth42.otpOn == false)
      {
        return "login success"
      }else{
      // if (!auth42.otp) {
        const qrcodeImg = await this.auth42Service.create42QRCode(payload.id);

        return qrcodeImg;
        // } else {
        // 	return 'Write OTP Code'
        // }
      }
    } else {
      throw new HttpException(
        'AUTH42가 유효하지 않습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  } catch (e) {
    throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
  }
}

  @Post('/login/otp')
  async loginOTP(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('code') code: string,
  ): Promise<void> {
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
        const newToken = await this.auth42Service.loginOTP(payload, code);
        res.cookie('accessToken', newToken);
        this.userService.updateStatus(payload.id, userStatus.ONLINE);
        res.send({ token: newToken });
      } else {
        throw new HttpException(
          'AUTH42가 유효하지 않습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('/otp/on')
  @UseGuards(JwtAuthGuard)
  updateOtpOn(@Req() req: Request) {
    try {
      return this.auth42Service.updateOtpOn(req.user.userId);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('/otp/off')
  @UseGuards(JwtAuthGuard)
  updateOtpOff(@Req() req: Request) {
    try {
      return this.auth42Service.updateOtpOff(req.user.userId);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
