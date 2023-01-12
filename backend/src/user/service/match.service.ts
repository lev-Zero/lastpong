import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserMatchDto } from '../dto/user.dto';
import { Match } from '../entity/match.entity';
import { User } from '../entity/user.entity';
import { UserService } from './user.service';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
  ) {}

  async findMatcheById(userId: number): Promise<Match[]> {
    try {
      const user = await this.userService.findUserById(userId);

      const matches = await this.matchRepository.find({
        relations: {
          winner: true,
          loser: true,
        },
        where: [{ winner: user }, { loser: user }],
      });
      for (const match of matches) {
        delete match.loser.token;
        delete match.winner.token;
      }

      return matches;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findMatcheByName(name: string): Promise<Match[]> {
    try {
      const user = await this.userService.findUserByName(name);

      const matches = await this.matchRepository.find({
        relations: {
          winner: true,
          loser: true,
        },
        where: [{ winner: user }, { loser: user }],
      });
      for (const match of matches) {
        delete match.loser.token;
        delete match.winner.token;
      }

      return matches;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async addMatch(matchResult: UserMatchDto): Promise<Match> {
    try {
      const winner = await this.userService.findUserById(matchResult.winnerId);
      const loser = await this.userService.findUserById(matchResult.loserId);
      const match = await this.matchRepository.create({
        winner,
        loser,
        winnerScore: matchResult.winnerScore,
        loserScore: matchResult.loserScore,
      });
      await this.matchRepository.save(match);
      return match;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateRating(winnerId: number, loserId: number): Promise<void> {
    try {
      const winner = await this.userService.findUserById(winnerId);
      const loser = await this.userService.findUserById(loserId);

      await this.userRepository.update(winner.id, {
        rating: winner.rating + 1,
      });
      if (loser.rating > 0)
        await this.userRepository.update(loser.id, {
          rating: loser.rating - 1,
        });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
