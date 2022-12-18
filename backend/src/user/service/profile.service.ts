import {
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../entity/profile.entity';
import { User } from '../entity/user.entity';
import { UserService } from './user.service';

@Injectable()
export class ProfileService {
	constructor(
		@InjectRepository(Profile)
		private profileRepository: Repository<Profile>,
		private userService:UserService
	) { }


	/*----------------------------------
	|								profile							 |
	----------------------------------*/

	async findProfileById(userId: number): Promise<Profile> {
		const user: User = await this.userService.findUserById(userId, ['profile']);
		if (!user.profile)
			throw new HttpException('USER X', HttpStatus.NOT_FOUND);
		return user.profile;
	}

	async findProfileByName(username: string): Promise<Profile> {
		const user: User = await this.userService.findUserByName(username, ['profile']);
		if (!user.profile)
			throw new HttpException('USER X', HttpStatus.NOT_FOUND);
		return user.profile;
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

	async updateOrCreateProfile(userId: number, file?: Express.Multer.File): Promise<Profile> {
		let filename = "default.png"
		let photoData = Buffer.from("");//input photo path
		
		if (file) { 
			filename = file.originalname;
			photoData = file.buffer;
		} 
		const user: User = await this.userService.findUserById(userId);

		let profile = await this.profileRepository.findOne({
			where:{user}
		})

		if (!profile) { 
				profile = await this.profileRepository.create({ filename, photoData, user });
		} else {
			if (file) { 
				profile.filename = file.originalname;
				profile.photoData = file.buffer;
			} else {
				profile.filename = filename;
				profile.photoData = photoData;				
			}
		}		
		try {
			await this.profileRepository.save(profile);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
		return profile;
	}

	async deleteProfile(userId: number): Promise<void> {
		try {
			await this.updateOrCreateProfile(userId);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
	}

}
