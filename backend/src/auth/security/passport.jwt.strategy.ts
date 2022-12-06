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
			secretOrKey: "SECRET_KEY"
		})
	}

	validate(payload: Payload): any {
		if (!payload.otpStatus || !payload.auth42Status)
			throw new HttpException('OTP VALIDATION X', HttpStatus.FORBIDDEN);
		return { userId: payload.id, username:payload.username }; //-> req.user
	}
}