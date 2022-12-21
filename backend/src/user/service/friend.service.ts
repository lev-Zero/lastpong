import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend } from '../entity/friend.entity';
import { UserService } from './user.service';

@Injectable()
export class FriendService {
	constructor(
		@InjectRepository(Friend)
		private friendRepository: Repository<Friend>,
		private userService: UserService,
	) { }

	async addFriendByName(friendOfferUserId: number, friendName: string): Promise<Friend> {
		try {
			const friendOfferUser = await this.userService.findUserById(friendOfferUserId);
			const friend = await this.userService.findUserByName(friendName);

			const friends = await this.findFriend(friendOfferUser.id).catch(() => null)

			for (const friendInArray of friends) {
				if (friend.id == friendInArray.friend.id)
					throw new HttpException("이미 친구입니다.", HttpStatus.BAD_REQUEST)
			}

			const addedFriend = await this.friendRepository.create({ friendOfferUser, friend })
			await this.friendRepository.save(addedFriend);
			return addedFriend
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	async addFriendById(friendOfferUserId: number, friendId: number): Promise<Friend> {
		try {
			const friendOfferUser = await this.userService.findUserById(friendOfferUserId);
			const friend = await this.userService.findUserById(friendId);

			const friends = await this.findFriend(friendOfferUser.id).catch(() => null)

			for (const friendInArray of friends) {
				if (friend.id == friendInArray.friend.id)
					throw new HttpException("이미 친구입니다.", HttpStatus.BAD_REQUEST)
			}

			const addedFriend = await this.friendRepository.create({ friendOfferUser, friend })
			await this.friendRepository.save(addedFriend);
			return addedFriend
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}


	async findFriend(id: number): Promise<Friend[]> {
		try {
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
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	async removeFriendByName(removeOfferUser: number, friendName: string) {
		try {
			const foundFriend = await this.userService.findUserByName(friendName).catch(() => null);
			const friend = foundFriend.id;
			await this.friendRepository
				.createQueryBuilder('friend') //alias = select Friend as friend
				.delete()
				.from(Friend)
				.where('friendOfferUserId = :id', { id: removeOfferUser })
				.where('friendId = :id', { id: friend })
				.execute();
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
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
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}


}
