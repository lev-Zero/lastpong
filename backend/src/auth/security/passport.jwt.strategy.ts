import { HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy, VerifiedCallback } from "passport-jwt";
import { AuthService } from "../service/auth.service";
import { Payload } from "../interface/payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: true,
			secretOrKey: process.env.JWT_SECRET
		})
	}

	validate(payload: Payload): any {
		try {
			if (!payload.otpStatus || !payload.auth42Status)
				throw new HttpException('OTP가 유효하지 않습니다.', HttpStatus.BAD_REQUEST);
			return { userId: payload.id, username: payload.username }; //-> req.user
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}
}