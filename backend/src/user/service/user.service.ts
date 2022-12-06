import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';

import { userStatus } from '../enum/status.enum';
import { user42Dto } from 'src/auth/dto/auth.dto';


@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,

	) { }

	/*----------------------------------
	|								user 							 |
	----------------------------------*/


	async findUserAll(): Promise<User[]> {
		
		const users = await this.userRepository
			.createQueryBuilder('users')
			.select(['users.id', 'users.username', 'users.rank', 'users.status'])
			.leftJoinAndSelect('users.avatar','avatar')
			.getMany()

		return users;
	}

	async findUserById(id: number, relations: string[] = []): Promise<User> {

		const user = await this.userRepository.findOne({
			select: {
				id: true,
				username: true,
				rank: true,
				status:true
			},
			where: { id },
			relations
		}).catch(() => null);

		if (!user) throw new HttpException('USER X', HttpStatus.NOT_FOUND);

		return user;
	}

	async findUserByName(username: string, relations: string[] = []): Promise<User> {
		const user = await this.userRepository.findOne({
			select: {
				id: true,
				username: true,
				rank: true,
				status: true
			},
			where: { username },
			relations
		}).catch(() => null);
		
		if (!user) throw new HttpException('USER X', HttpStatus.NOT_FOUND);

		return user;
	}

	async createUser(data: user42Dto): Promise<User> {
		const user = await this.userRepository.create({ username: data.username });
		try {
			await this.userRepository.save(user);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
		delete (user.token)
		return user;
	}



	async updateUserToken(userId: number, token: string) {
		this.userRepository.update(userId, { token: token });
	}
	
	async updateStatus(userId: number, status: userStatus): Promise<void> {
		const user = await this.findUserById(userId);

		if (user.status == status) return;

		try {
			await this.userRepository.update(user.id, { status });
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
	}


}
