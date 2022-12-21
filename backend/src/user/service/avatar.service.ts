import {
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Avatar } from '../entity/avatar.entity';
import { User } from '../entity/user.entity';
import { UserService } from './user.service';

@Injectable()
export class AvatarService {
	constructor(
		@InjectRepository(Avatar)
		private avatarRepository: Repository<Avatar>,
		private userService: UserService
	) { }


	/*----------------------------------
	|								avatar							 |
	----------------------------------*/

	async findAvatarById(userId: number): Promise<Avatar> {
		try {
			const user: User = await this.userService.findUserById(userId, ['avatar']);
			if (!user.avatar)
				throw new HttpException('USER X', HttpStatus.NOT_FOUND);
			return user.avatar;
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	async findAvatarByName(username: string): Promise<Avatar> {
		try {
			const user: User = await this.userService.findUserByName(username, ['avatar']);
			if (!user.avatar)
				throw new HttpException('USER X', HttpStatus.NOT_FOUND);
			return user.avatar;
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}


	/*
		file: {
			fieldname: 'file',
			originalname: 'asdf.png',
			encoding: '7bit',
			mimetype: 'image/png',
			buffer: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 03 63 00 00 01 ad 08 06 00 00 00 9b 4c ac e4 00 00 00 09 70 48 59 73 00 00 0b 13 00 00 0b 13 01 ... 619325 more bytes>,
			size: 619375
		}
	*/

	async updateOrCreateAvatar(userId: number, profileUrl?: string, file?: Express.Multer.File): Promise<Avatar> {
		try {
			let filename = null;
			let photoData = null;

			if (file) {
				filename = file.originalname;
				photoData = file.buffer;
			}
			const user = await this.userService.findUserById(userId);

			let avatar = await this.avatarRepository.findOne({
				where: { user }
			}).catch(() => null)

			if (!avatar) {
				if (!profileUrl)
					profileUrl = "empty";
				avatar = await this.avatarRepository.create({ filename, photoData, user, profileUrl });
			} else {
				avatar.filename = filename;
				avatar.photoData = photoData;
			}
			await this.avatarRepository.save(avatar);

			return avatar;
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	// async deleteAvatar(userId: number): Promise<void> {
	// 	try {
	// 		await this.updateOrCreateAvatar(userId, );
	// 	} catch (e) {
	// 		throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
	// 	}
	// }

}
