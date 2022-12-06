import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { Auth42 } from '../entity/auth42.entity';
import { Payload } from '../interface/payload.interface';
import { generateSecret, verify } from '2fa-util';
import { AvatarService } from 'src/user/service/avatar.service';
import { AuthService } from './auth.service';
import * as https from 'https';

const download = (url: string): Promise<Buffer> =>
	new Promise((resolve, reject) => {
		https
			.get(url, (res) => {
				const data = [];
				res
					.on('data', (chunk) => data.push(chunk))
					.on('end', () => resolve(Buffer.concat(data)));
			})
			.on('error', (err) => reject(err));
	});


@Injectable()
export class Auth42Service {
	private secrets: Map<number, string> = new Map();
	constructor(
		@InjectRepository(Auth42)
		private readonly auth42Repository: Repository<Auth42>,
		private userService: UserService,
		private authService:AuthService,
		private avatarService: AvatarService,

	) { }



		
/*----------------------------------
|				42 AUTH LOGIN 						 |
----------------------------------*/

	/*
	Auth42AuthGuard -> Auth42Strategy -> FtauthGuard -> authController.redirect -> authService.login
	*/
	async login(data): Promise<string> {
		
		const findUser = await this.userService.findUserByName(data.username).catch(() => null)

		if (!findUser) {
			const user = await this.userService.createUser(data);

			let auth42 = await this.createAuth42(user.id, data.id);

			if (data.photos) {
				const photo = await download(data.profileUrl);
				await this.avatarService.updateOrCreateAvatar(user.id, {
					originalname: 'profilePhoto',
					buffer: photo,
				} as Express.Multer.File);
			}
		}

		const user = await this.userService.findUserByName(data.username);

		const auth42Status = true;
		const otpStatus = false;

		return this.authService.generateJWT(user.id, auth42Status, otpStatus);
	}


	/*----------------------------------
	|								OTP								 |
	----------------------------------*/



	async createAuth42(userId: number, userIdIn42?:number): Promise<Auth42> {
		let auth42 = await this.findAuth42ById(userId).catch(()=>null)

		if (auth42)
			throw new HttpException(
				'ALREADLY EXIST AUTH42 USER',
				HttpStatus.CONFLICT,
			);

		auth42 = this.auth42Repository.create({ user: { id: userId }, userIdIn42 });

		try {
			await this.auth42Repository.save(auth42);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
		return auth42;
	}

	async findAuth42ById(
		userId: number,
		relations = [] as string[],
	): Promise<Auth42> {

		const user = await this.userService.findUserById(userId)

		const auth42 = await this.auth42Repository.findOne({
			where: {user},
			relations,
		});
		if (!auth42)
			throw new HttpException('AUTH42 X', HttpStatus.NOT_FOUND);

		return auth42;
	}

	async create42QRCode(userId: number): Promise<string> {

		const auth42 = await this.findAuth42ById(userId, ['user'])

		if (auth42.otp)
			throw new HttpException('ALREADLY EXIST OTP', HttpStatus.FORBIDDEN);

		const output = await generateSecret(auth42.user.username, 'jeonghwl')

		this.secrets.set(auth42.user.id, output.secret);

		auth42.otp = output.secret;
		await this.auth42Repository.save(auth42);
		delete (output.secret)
		return output;
	}


	async loginOTP(payload: Payload, code: string): Promise<string> {
	
		if (payload.otpStatus)
			throw new HttpException('ALREADLY CONNECTED', HttpStatus.CONFLICT);

		await this.verifyCode(payload.id, code);
		
		const auth42Status = true;
		const otpStatus = true;
		return this.authService.generateJWT(payload.id, auth42Status, otpStatus);
	}


	async verifyCode(
		userId: number, code: string, secret?: string,
	): Promise<void> {
		if (!secret) {
			const auth42 = await this.findAuth42ById(userId);
			secret = auth42.otp;
		}

		if (!secret)
			throw new HttpException('SECRET X', HttpStatus.NOT_FOUND);

		const check = await verify(code, secret);
		if (!check) throw new HttpException('INVALID CODE', HttpStatus.FORBIDDEN);
	}



}
