import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';

import { userStatus } from '../enum/status.enum';
import { user42Dto } from 'src/auth/dto/auth.dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private jwtService: JwtService

	) { }


	/*----------------------------------
	|								TEST 							 |
	----------------------------------*/

	async testCreateFakeUser(username: string): Promise<User> {

		const user = await this.userRepository.create({ username })
		await this.userRepository.save(user);

		const auth42Status = true;
		const otpStatus = true;
		const payload = { id: user.id, username: user.username, auth42Status, otpStatus };

		const token = await this.jwtService.sign(payload);
		this.updateUserToken(user.id, token);
		return user;
	}

	async testFindUser(username: string): Promise<User> {
		const user = this.userRepository.findOne({ where: { username } })

		return user;
	}

	async testDeleteFakeUser(username: string) {

		try {
			this.userRepository
				.createQueryBuilder('user')
				.delete()
				.from(User)
				.where("username = :username", { username: username })
				.execute()
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);

		}

	}

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
		console.log("[userService] createUser")
		console.log({data})
		const user = await this.userRepository.create({ username: data.username });
		console.log("2")
		try {
			console.log("22")
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
