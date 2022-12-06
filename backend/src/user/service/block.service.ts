import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from '../entity/block.entity';
import { UserService } from './user.service';

@Injectable()
export class BlockService { 
	constructor(
		@InjectRepository(Block)
		private blockRepository: Repository<Block>,
		private userService:UserService
	) { }

	async addBlockByName(blockOfferUserId: number, blockedName: string): Promise<Block> {

		const blockOfferUser = await this.userService.findUserById(blockOfferUserId);
		const blockedUser = await this.userService.findUserByName(blockedName);

		const newBlock = await this.blockRepository.create({ blockOfferUser, blockedUser })
		try {
			await this.blockRepository.save(newBlock);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
		return newBlock
	}

	async addBlockById(blockOfferUserId: number, blockedUserId: number): Promise<Block> {
		const blockOfferUser = await this.userService.findUserById(blockOfferUserId);
		const blockedUser = await this.userService.findUserById(blockedUserId);

		const newBlock = await this.blockRepository.create({ blockOfferUser, blockedUser })
		try {
			await this.blockRepository.save(newBlock);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
		return newBlock
	}

	async findBlock(id: number): Promise<Block[]> {
		const user = await this.userService.findUserById(id);
		
		const blockedUser = await this.blockRepository.find({
			relations: {
				blockedUser:true
			},
			where: {
				blockOfferUser: user
			}
		})

		for (const user of blockedUser) {
			delete (user.blockedUser.token)
		}

		return blockedUser
	}

	async removeBlockByName(removeOfferUser: number, blockedName: string) {
		const foundBlock = await this.userService.findUserByName(blockedName);
		const blockedUser = foundBlock.id;
		try {
			await this.blockRepository
				.createQueryBuilder('blockedUser') //alias = select Block as blockedUser
				.delete()
				.from(Block)
				.where('blockOfferUser = :id', { id: removeOfferUser })
				.where('blockedUser = :id', { id: blockedUser })
				.execute();
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
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
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
	}
}
