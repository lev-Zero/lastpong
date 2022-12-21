import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from '../entity/block.entity';
import { FriendService } from './friend.service';
import { UserService } from './user.service';

@Injectable()
export class BlockService {
	constructor(
		@InjectRepository(Block)
		private blockRepository: Repository<Block>,
		private userService: UserService,
		private friendService: FriendService
	) { }

	async addBlockByName(blockOfferUserId: number, blockedName: string): Promise<Block> {
		try {
			const blockOfferUser = await this.userService.findUserById(blockOfferUserId);
			const blockedUser = await this.userService.findUserByName(blockedName);


			const friends = await this.friendService.findFriend(blockOfferUser.id).catch(() => null)

			for (const friendInArray of friends) {
				if (blockedUser.id == friendInArray.friend.id)
					throw new HttpException("친구는 블락할 수 없습니다.", HttpStatus.BAD_REQUEST)
			}


			const blocks = await this.findBlock(blockOfferUser.id).catch(() => null)

			for (const blockInArray of blocks) {
				if (blockedUser.id == blockInArray.block.id)
					throw new HttpException("이미 블락된 유저입니다.", HttpStatus.BAD_REQUEST)
			}

			const newBlock = await this.blockRepository.create({ blockOfferUser, blockedUser })

			try {
				await this.blockRepository.save(newBlock);
			} catch (e) {
				throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
			}
			return newBlock
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}

	}

	async addBlockById(blockOfferUserId: number, blockedUserId: number): Promise<Block> {
		try {
			const blockOfferUser = await this.userService.findUserById(blockOfferUserId);
			const blockedUser = await this.userService.findUserById(blockedUserId);


			const friends = await this.friendService.findFriend(blockOfferUser.id).catch(() => null)

			for (const friendInArray of friends) {
				if (blockedUser.id == friendInArray.friend.id)
					throw new HttpException("친구는 블락할 수 없습니다.", HttpStatus.BAD_REQUEST)
			}

			const blocks = await this.findBlock(blockOfferUser.id).catch(() => null)

			for (const blockInArray of blocks) {
				if (blockedUser.id == blockInArray.block.id)
					throw new HttpException("이미 블락된 유저입니다.", HttpStatus.BAD_REQUEST)
			}

			const newBlock = await this.blockRepository.create({ blockOfferUser, blockedUser })
			try {
				await this.blockRepository.save(newBlock);
			} catch (e) {
				throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
			}
			return newBlock
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	async findBlock(id: number): Promise<Block[]> {
		try {
			const user = await this.userService.findUserById(id);

			const blockedUser = await this.blockRepository.find({
				relations: {
					blockedUser: true
				},
				where: {
					blockOfferUser: user
				}
			})

			for (const user of blockedUser) {
				delete (user.blockedUser.token)
			}

			return blockedUser
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	async removeBlockByName(removeOfferUser: number, blockedName: string) {
		try {
			const foundBlock = await this.userService.findUserByName(blockedName);
			const blockedUser = foundBlock.id;
			await this.blockRepository
				.createQueryBuilder('blockedUser') //alias = select Block as blockedUser
				.delete()
				.from(Block)
				.where('blockOfferUser = :id', { id: removeOfferUser })
				.where('blockedUser = :id', { id: blockedUser })
				.execute();
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	async removeBlockById(removeOfferUser: number, blockedUser: number) {
		try {
			await this.blockRepository
				.createQueryBuilder('blockedUser')
				.delete()
				.from(Block)
				.where('blockOfferUser = :id', { id: removeOfferUser })
				.where('blockedUser = :id', { id: blockedUser })
				.execute();
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}
}
