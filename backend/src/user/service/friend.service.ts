import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend } from '../entity/friend.entity';
import { User } from '../entity/user.entity';
import { UserService } from './user.service';

@Injectable()
export class FriendService { 
	constructor(
		@InjectRepository(Friend)
		private friendRepository: Repository<Friend>,
		private userService:UserService
	) { }

	async addFriendByName(friendOfferUserId: number, friendName: string): Promise<Friend> {
		const friendOfferUser = await this.userService.findUserById(friendOfferUserId);		
		const friend = await this.userService.findUserByName(friendName);
		const addedFriend = await this.friendRepository.create({ friendOfferUser, friend })
		try {
			await this.friendRepository.save(addedFriend);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
		return addedFriend
	}

	async addFriendById(friendOfferUserId: number, friendId: number): Promise<Friend> {
		const friendOfferUser = await this.userService.findUserById(friendOfferUserId);		
		const friend = await this.userService.findUserById(friendId);
		const addedFriend = await this.friendRepository.create({ friendOfferUser, friend })
		try {
			await this.friendRepository.save(addedFriend);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
		return addedFriend
	}

	async findFriend(id: number): Promise<Friend[]> { 
		const user = await this.userService.findUserById(id);		
		
		const friend = await this.friendRepository.find({
			relations: {
				friend: true,
			},
			where: {
				friendOfferUser: user
			}
		})
		
		for (const f of friend) { 
			delete (f.friend.token)
		}
		return friend
	}

	async removeFriendByName(removeOfferUser: number, friendName: string) { 
		const foundFriend = await this.userService.findUserByName(friendName);
		const friend = foundFriend.id;
		try {
			await this.friendRepository
				.createQueryBuilder('friend') //alias = select Friend as friend
				.delete()
				.from(Friend)
				.where('friendOfferUserId = :id', { id: removeOfferUser })
				.where('friendId = :id', { id: friend })
				.execute();
		} catch (error) { 
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
	}

	async removeFriendById(removeOfferUser: number, friend: number) {
		try {
			await this.friendRepository
				.createQueryBuilder('friend') //alias = select Friend as friend
				.delete()
				.from(Friend)
				.where('friendOfferUserId = :id', { id: removeOfferUser })
				.where('friendId = :id', { id: friend })
				.execute();
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
	}


}
