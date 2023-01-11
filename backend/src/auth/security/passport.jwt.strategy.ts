import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../service/auth.service';
import { Payload } from '../interface/payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(
    payload: Payload,
  ): { userId: number; username: string } | HttpException {
    try {
      if (!payload.otpStatus || !payload.auth42Status)
        throw new HttpException(
          'OTP가 유효하지 않습니다.',
          HttpStatus.BAD_REQUEST,
        );
      return { userId: payload.id, username: payload.username }; //-> req.user
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
