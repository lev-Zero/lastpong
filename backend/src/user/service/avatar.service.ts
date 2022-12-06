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
		private userService:UserService
	) { }


	/*----------------------------------
	|								avatar							 |
	----------------------------------*/

	async findAvatarById(userId: number): Promise<Avatar> {
		const user: User = await this.userService.findUserById(userId, ['avatar']);
		if (!user.avatar)
			throw new HttpException('USER X', HttpStatus.NOT_FOUND);
		return user.avatar;
	}

	async findAvatarByName(username: string): Promise<Avatar> {
		const user: User = await this.userService.findUserByName(username, ['avatar']);
		if (!user.avatar)
			throw new HttpException('USER X', HttpStatus.NOT_FOUND);
		return user.avatar;
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

	async updateOrCreateAvatar(userId: number, file?: Express.Multer.File): Promise<Avatar> {
		let filename = "default.png"
		let photoData = Buffer.from("");//input photo path
		
		if (file) { 
			filename = file.originalname;
			photoData = file.buffer;
		} 
		const user: User = await this.userService.findUserById(userId);

		let avatar = await this.avatarRepository.findOne({
			where:{user}
		})

		if (!avatar) { 
				avatar = await this.avatarRepository.create({ filename, photoData, user });
		} else {
			if (file) { 
				avatar.filename = file.originalname;
				avatar.photoData = file.buffer;
			} else {
				avatar.filename = filename;
				avatar.photoData = photoData;				
			}
		}		
		try {
			await this.avatarRepository.save(avatar);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
		return avatar;
	}

	async deleteAvatar(userId: number): Promise<void> {
		try {
			await this.updateOrCreateAvatar(userId);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
	}

}
