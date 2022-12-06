import { Strategy } from 'passport-42';

import { PassportStrategy } from '@nestjs/passport';
import { Injectable} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { user42Dto } from '../dto/auth.dto';

@Injectable()
export class Auth42Strategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly authService: AuthService
	) {
		super({
			clientID: process.env.UID,
			clientSecret: process.env.SECRET,
			callbackURL: process.env.CALLBACK_URI,
			scope: 'public',
		});
	}

	validate(
		profile: user42Dto,
	): user42Dto {
		return profile; // -> req.user
	}
}
