import { Strategy } from 'passport-42';

import { PassportStrategy } from '@nestjs/passport';
import { Injectable} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { user42Dto } from '../dto/auth.dto';
import { Profile } from 'passport';
import { User } from 'src/user/entity/user.entity';
import { identity } from 'rxjs';

@Injectable()
export class Auth42Strategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly authService: AuthService
	) {
		super({
			clientID: process.env.UID,
			clientSecret: process.env.SECRET,
			callbackURL: process.env.CALLBACK_URI,
			// scope: 'public',
		});
	}

	async validate(accessToken: string, refreshToken: string, profile) {
		const user = {
			username: profile.username,
			id42: profile.id,
			profileUrl:profile.profileUrl
		}
		return user;
	}
}
