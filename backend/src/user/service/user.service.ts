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
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /*----------------------------------
	|								TEST 							 |
	----------------------------------*/

  async testCreateFakeUser(username: string): Promise<User> {
    const user = await this.userRepository.create({ username });
    await this.userRepository.save(user);

    const auth42Status = true;
    const otpStatus = true;
    const payload = {
      id: user.id,
      username: user.username,
      auth42Status,
      otpStatus,
    };

    const token = await this.jwtService.sign(payload);
    this.updateUserToken(user.id, token);
    return user;
  }

  async testFindUser(username: string): Promise<User> {
    const user = this.userRepository.findOne({
      where: { username },
      relations: ['avatar'],
    });

    return user;
  }

  async testDeleteFakeUser(username: string) {
    try {
      this.userRepository
        .createQueryBuilder('user')
        .delete()
        .from(User)
        .where('username = :username', { username: username })
        .execute();
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  /*----------------------------------
	|								user 							 |
	----------------------------------*/

  async findUserAll(): Promise<User[]> {
    try {
      const users = await this.userRepository
        .createQueryBuilder('users')
        .select([
          'users.id',
          'users.username',
          'users.rating',
          'users.status',
          'users.username42',
        ])
        // .leftJoinAndSelect('users.avatar', 'avatar')
        .getMany();

      return users;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findUserById(id: number, relations: string[] = []): Promise<User> {
    try {
      const user = await this.userRepository
        .findOne({
          select: {
            id: true,
            username: true,
            rating: true,
            status: true,
            username42: true,
          },
          where: { id },
          relations,
        })
        .catch(() => null);

      if (!user)
        throw new HttpException(
          '유저를 찾을 수 없습니다.',
          HttpStatus.BAD_REQUEST,
        );

      return user;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findUserByName(
    username: string,
    relations: string[] = [],
  ): Promise<User> {
    try {
      const user = await this.userRepository
        .findOne({
          select: {
            id: true,
            username: true,
            rating: true,
            status: true,
            username42: true,
          },
          where: { username },
          relations,
        })
        .catch(() => null);

      if (!user)
        throw new HttpException(
          '유저를 찾을 수 없습니다.',
          HttpStatus.BAD_REQUEST,
        );

      return user;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async find42UserByName(
    username42: string,
    relations: string[] = [],
  ): Promise<User> {
    try {
      const user = await this.userRepository
        .findOne({
          select: {
            id: true,
            username42: true,
            rating: true,
            status: true,
          },
          where: { username42 },
          relations,
        })
        .catch(() => null);

      if (!user)
        throw new HttpException(
          '유저를 찾을 수 없습니다.',
          HttpStatus.BAD_REQUEST,
        );

      return user;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createUser(data: user42Dto): Promise<User> {
    try {
      const user = await this.userRepository.create({
        username: '',
        username42: data.username,
      });
      await this.userRepository.save(user);
      delete user.token;
      return user;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateUserToken(userId: number, token: string) {
    try {
      this.userRepository.update(userId, { token: token });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateStatus(userId: number, status: userStatus): Promise<void> {
    try {
      const user = await this.findUserById(userId);
      if (user.status == status) return;
      await this.userRepository.update(user.id, { status });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateUserName(userId: number, newUserName: string): Promise<User> {
    try {
      let user = await this.findUserById(userId).catch(() => null);
      if (!user)
        throw new HttpException(
          '해당 유저는 없습니다.',
          HttpStatus.BAD_REQUEST,
        );
      const isUsingUserName = await this.findUserByName(newUserName).catch(
        () => null,
      );
      if (!isUsingUserName) {
        await this.userRepository.update(user.id, { username: newUserName });
        user = await this.findUserById(userId);
      } else {
        throw new HttpException(
          '이미 사용중인 username 입니다.',
          HttpStatus.BAD_REQUEST,
        );
      }
      return user;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
