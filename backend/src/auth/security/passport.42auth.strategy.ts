import { Strategy } from 'passport-42';

import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../service/auth.service';

@Injectable()
export class Auth42Strategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.UID,
      clientSecret: process.env.SECRET,
      callbackURL: process.env.CALLBACK_URI,
      scope: 'public',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<
    | {
        username: string;
        profileUrl: string | null;
        accessToken42: string;
      }
    | HttpException
  > {
    try {
      const user = {
        username: profile.username,
        profileUrl: profile.profileUrl,
        accessToken42: accessToken,
      };
      return user;
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
