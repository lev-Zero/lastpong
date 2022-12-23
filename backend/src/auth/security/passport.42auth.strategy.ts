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

  async validate(accessToken: string, refreshToken: string, profile) {
    try {
      const user = {
        username: profile.username,
        id42: profile.id,
        profileUrl: profile.profileUrl,
      };
      return user;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
