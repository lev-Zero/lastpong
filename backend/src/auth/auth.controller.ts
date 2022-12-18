import { Body, Controller, Delete, Get, HttpException, HttpStatus, Post, Put, Query, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { Response } from 'express';
import { Auth42AuthGuard } from './security/auth.guard';
import { Request } from 'src/user/interface/user.interface';
import { JwtAuthGuard } from './security/jwt.guard';
import { Auth42Service } from 'src/auth/service/auth42.service';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private auth42Service: Auth42Service

	) { }


	/*----------------------------------
	|								login							 |
	|								loginout					 |
	----------------------------------*/

	@Get('/')
	viaPath(@Res() res: Response) {
		res.status(301).redirect("http://localhost:3000/auth/42/callback")
	}

	/*
	Auth42AuthGuard -> Auth42Strategy -> FtauthGuard ->
	*/
	@Get('/42/callback')
	@UseGuards(Auth42AuthGuard)
	async redirect(@Req() req: any, @Res({ passthrough: true }) res: Response) {		

		if (req.user) {
		const token = await this.auth42Service.login(req.user);
			res.cookie('access_token', token, {
				httpOnly: false,
			});
		res.send({ "status": "login" })//redirect -> token x
		}
	}

	@Get('/logout')
	@UseGuards(JwtAuthGuard)
	logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		res.cookie('access_token', '', {
			httpOnly: false,
		});
		res.send({ "status": "logout" })//redirect
	}




	/*----------------------------------
	|								OTP								 |
	----------------------------------*/

	@Get('/login/otp/check')
	async loginOTPCheck(
		@Req() req:Request
	): Promise<string>{
		let token;
		if (req.headers.authorization)
			token = req.headers.authorization.split(' ')[1]
		else
			throw new HttpException('TOKEN X', HttpStatus.FORBIDDEN);
		
		const payload = await this.authService.verifyJWT(token);

		if (payload.auth42Status) { 
			const auth42 = await this.auth42Service.findAuth42ById(payload.id).catch(()=>null)
			if (!auth42)
				throw new HttpException('AUTH42 X', HttpStatus.FORBIDDEN);
				
			if (!auth42.otp) {
				const qrcodeImg = await this.auth42Service.create42QRCode(payload.id);

				return qrcodeImg
			} else {
				return 'Write OTP Code'
			}
		} else {
			throw new HttpException('AUTH42 VALIDATION X', HttpStatus.FORBIDDEN);
		}
	}

	@Post('/login/otp')
	async loginOTP(
		@Req() req: Request,
		@Res() res: Response,
		@Body('code') code: string,
	): Promise<void> {

		let token;
		if (req.headers.authorization)
			token = req.headers.authorization.split(' ')[1]
		else
			throw new HttpException('TOKEN X', HttpStatus.FORBIDDEN);

		const payload = await this.authService.verifyJWT(token);

		const auth42 = await this.auth42Service.findAuth42ById(payload.id).catch(()=>null)

		
		if (payload.auth42Status) { 
			const newToken = await this.auth42Service.loginOTP(payload, code);
			res.cookie('access_token', token, {
				httpOnly: false,
			});
			res.send(newToken)
		} else {
			throw new HttpException('AUTH42 VALIDATION', HttpStatus.FORBIDDEN);
		}
	}

}
