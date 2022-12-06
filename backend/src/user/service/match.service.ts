import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserMatchDto } from '../dto/user.dto';
import { Match } from '../entity/match.entity';
import { UserService } from './user.service';

@Injectable()
export class MatchService { 
	constructor(
		@InjectRepository(Match)
		private matchRepository: Repository<Match>,
		private userService:UserService
	) { }

	async findMatcheById(userId: number): Promise<Match[]> {
		const user = await this.userService.findUserById(userId);

		const matches = await this.matchRepository.find({
			relations: {
				winner: true,
				loser: true
			},
			where:  [
					{ winner: user },
					{loser:user}
				]
	
		})
		for (const match of matches) { 
			delete(match.loser.token)
			delete (match.winner.token)		
		}

		return matches;
	}

	async findMatcheByName(name: string): Promise<Match[]> {
		const user = await this.userService.findUserByName(name);

		const matches = await this.matchRepository.find({
			relations: {
				winner: true,
				loser: true
			},
			where: [
				{ winner: user },
				{ loser: user }
			]

		})
		for (const match of matches) {
			delete (match.loser.token)
			delete (match.winner.token)
		}

		return matches;
	}

	async addMatchById(matchResult: UserMatchDto):Promise<void> { 
		const winner = await this.userService.findUserById(matchResult.winnerId);
		const loser = await this.userService.findUserById(matchResult.loserId);
		const match = await this.matchRepository.create({ winner,loser, winnerScore:matchResult.winnerScore, loserScore:matchResult.loserScore })
		try { 
			await this.matchRepository.save(match)
		} catch (error) { 
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);

		}
	}

}
