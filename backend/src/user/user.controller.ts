import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { Match } from './entity/match.entity';
import { User } from './entity/user.entity';
import { AvatarService } from './service/avatar.service';
import { UserService } from './service/user.service';

import { Request } from './interface/user.interface';

import { JwtAuthGuard } from 'src/auth/security/jwt.guard';

import { FileInterceptor } from '@nestjs/platform-express';
import { BlockService } from './service/block.service';
import { FriendService } from './service/friend.service';
import { MatchService } from './service/match.service';
import { Friend } from './entity/friend.entity';
import { Block } from './entity/block.entity';
import {
  UserMatchDto,
  UserMatchIdDto,
  UserNameDto,
  UserUpdateNameDto,
} from './dto/user.dto';
import { Avatar } from './entity/avatar.entity';
import { Readable } from 'typeorm/platform/PlatformTools';
import { Auth42Service } from 'src/auth/service/auth42.service';

import { Sanitizer } from 'class-sanitizer';
import { userStatus } from './enum/status.enum';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly avatarService: AvatarService,
    private readonly blockService: BlockService,
    private readonly friendService: FriendService,
    private readonly matchService: MatchService,
    private readonly auth42Service: Auth42Service,
  ) {}

  /*----------------------------------
	|								TEST 							 |
	----------------------------------*/

  //http://localhost:3000/user/test/create/fakeuser
  @Get('/test/create/fakeuser')
  async testCreateUser() {
    this.testDeleteUser();
    const photoUrl =
      'https://velog.velcdn.com/images%2Fseeh_h%2Fpost%2F46d59d0b-4a8a-4f5d-a173-045d433919bc%2Fimage.png';
    let user;
    user = await this.userService.testCreateFakeUser('fake_U1');
    await this.avatarService.updateOrCreateAvatar(user.id, photoUrl, {
      originalname: 'fakePhoto',
      buffer: null,
    } as Express.Multer.File);
    await this.auth42Service.createAuth42(user.id);
    this.userService.updateStatus(user.userId, userStatus.ONLINE);
    user = await this.userService.testCreateFakeUser('fake_U2');
    await this.avatarService.updateOrCreateAvatar(user.id, photoUrl, {
      originalname: 'fakePhoto',
      buffer: null,
    } as Express.Multer.File);
    await this.auth42Service.createAuth42(user.id);
    this.userService.updateStatus(user.userId, userStatus.ONLINE);
    user = await this.userService.testCreateFakeUser('fake_U3');
    await this.avatarService.updateOrCreateAvatar(user.id, photoUrl, {
      originalname: 'fakePhoto',
      buffer: null,
    } as Express.Multer.File);
    await this.auth42Service.createAuth42(user.id);
    this.userService.updateStatus(user.userId, userStatus.ONLINE);
    user = await this.userService.testCreateFakeUser('fake_U4');
    await this.avatarService.updateOrCreateAvatar(user.id, photoUrl, {
      originalname: 'fakePhoto',
      buffer: null,
    } as Express.Multer.File);
    await this.auth42Service.createAuth42(user.id);
    this.userService.updateStatus(user.userId, userStatus.ONLINE);
    user = await this.userService.testCreateFakeUser('fake_U5');
    await this.avatarService.updateOrCreateAvatar(user.id, photoUrl, {
      originalname: 'fakePhoto',
      buffer: null,
    } as Express.Multer.File);
    await this.auth42Service.createAuth42(user.id);
    this.userService.updateStatus(user.userId, userStatus.ONLINE);
  }

  //http://localhost:3000/user/test/delete/fakeuser
  @Get('/test/delete/fakeuser')
  testDeleteUser() {
    this.userService.testDeleteFakeUser('fake_U1');
    this.userService.testDeleteFakeUser('fake_U2');
    this.userService.testDeleteFakeUser('fake_U3');
    this.userService.testDeleteFakeUser('fake_U4');
    this.userService.testDeleteFakeUser('fake_U5');
  }
  @Get('/test/read/fakeuser/:name')
  testFindUser(@Param('name') name: string) {
    const fakeuser = this.userService.testFindUser(name);
    const user = fakeuser;
    return user;
  }

  /*----------------------------------
	|								user 							 |
	----------------------------------*/
  @Get()
  findUserAll(): Promise<User[]> | HttpException {
    try {
      return this.userService.findUserAll();
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/id/:id')
  findUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User> | HttpException {
    try {
      const user = this.userService.findUserById(id);
      return user;
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/name/:name')
  findUserByName(@Param('name') name: string): Promise<User> | HttpException {
    try {
      const data = this.userParameterSanitizer(name);
      const user = this.userService.findUserByName(data);
      return user;
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  findMe(@Req() req: Request): Promise<User> | HttpException {
    try {
      return this.userService.findUserById(req.user.userId);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  @Patch('/me')
  @UseGuards(JwtAuthGuard)
  updateUserName(
    @Req() req: Request,
    @Body() body: UserUpdateNameDto,
  ): Promise<User> | HttpException {
    try {
      const data = this.userParameterSanitizer(body.newUserName);
      return this.userService.updateUserName(req.user.userId, data);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  /*----------------------------------
	|								avatar							 |
	----------------------------------*/

  @Get('/avatar/id/:userId')
  async findAvatarById(
    @Param('userId', ParseIntPipe) userId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    | StreamableFile
    | { profilePhoto: string; profileUrl: string }
    | HttpException
  > {
    try {
      const avatar = await this.avatarService
        .findAvatarById(userId)
        .catch(() => null);
      if (!avatar.photoData && !avatar.profileUrl)
        return { profilePhoto: 'empty', profileUrl: 'empty' };
      else if (!avatar.photoData && avatar.profileUrl)
        return { profilePhoto: 'empty', profileUrl: avatar.profileUrl };
      else {
        res.set({
          'Content-Type': 'image/*',
        });
        return new StreamableFile(Readable.from(avatar.photoData));
      }
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/avatar/name/:name')
  async findAvatarByName(
    @Param('name') name: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    | StreamableFile
    | { profilePhoto: string; profileUrl: string }
    | HttpException
  > {
    try {
      const data = this.userParameterSanitizer(name);
      const avatar = await this.avatarService
        .findAvatarByName(data)
        .catch(() => null);
      if (!avatar.photoData && !avatar.profileUrl)
        return { profilePhoto: 'empty', profileUrl: 'empty' };
      else if (!avatar.photoData && avatar.profileUrl)
        return { profilePhoto: 'empty', profileUrl: avatar.profileUrl };
      else {
        res.set({
          'Content-Type': 'image/*',
        });
        return new StreamableFile(Readable.from(avatar.photoData));
      }
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/avatar/me')
  @UseGuards(JwtAuthGuard)
  async findAvatarMe(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    | StreamableFile
    | { profilePhoto: string; profileUrl: string }
    | HttpException
  > {
    try {
      const avatar = await this.avatarService
        .findAvatarById(req.user.userId)
        .catch(() => null);
      if (!avatar.photoData && !avatar.profileUrl)
        return { profilePhoto: 'empty', profileUrl: 'empty' };
      else if (!avatar.photoData && avatar.profileUrl)
        return { profilePhoto: 'empty', profileUrl: avatar.profileUrl };
      else {
        res.set({
          'Content-Type': 'image/*',
        });
        return new StreamableFile(Readable.from(avatar.photoData));
      }
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('/avatar/me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  updateAvatar(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Avatar> | HttpException {
    try {
      return this.avatarService.updateOrCreateAvatar(
        req.user.userId,
        null,
        file,
      );
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  /*----------------------------------
	|								match							 |
	----------------------------------*/

  @Get('/match/id/:id')
  findMatcheById(
    @Param('id', ParseIntPipe) userid: number,
  ): Promise<Match[]> | HttpException {
    try {
      return this.matchService.findMatcheById(userid);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/match/name/:name')
  findMatcheByName(
    @Param('name') username: string,
  ): Promise<Match[]> | HttpException {
    try {
      const data = this.userParameterSanitizer(username);
      return this.matchService.findMatcheByName(data);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/match/add')
  @UseGuards(JwtAuthGuard)
  async addMatch(@Body() body: UserMatchDto): Promise<Match | HttpException> {
    try {
      return await this.matchService.addMatch(body);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/match/rating')
  @UseGuards(JwtAuthGuard)
  async updateRating(
    @Body() body: UserMatchIdDto,
  ): Promise<string | HttpException> {
    try {
      await this.matchService.updateRating(body.winnerId, body.loserId);
      return JSON.stringify({ status: 'updated rating' });
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  /*----------------------------------
	|								friend						 |
	----------------------------------*/
  @Post('/friend/name')
  @UseGuards(JwtAuthGuard)
  addFriendByName(
    @Req() req: Request,
    @Body() body: UserNameDto,
  ): Promise<Friend> | HttpException {
    try {
      const data = this.userParameterSanitizer(body.username);
      return this.friendService.addFriendByName(req.user.userId, data);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/friend/id/:id')
  @UseGuards(JwtAuthGuard)
  addFriendById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Friend> | HttpException {
    try {
      return this.friendService.addFriendById(req.user.userId, id);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/friend')
  @UseGuards(JwtAuthGuard)
  findFriend(@Req() req: Request): Promise<Friend[]> | HttpException {
    try {
      return this.friendService.findFriend(req.user.userId);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/friend/name')
  @UseGuards(JwtAuthGuard)
  removeFriendByName(
    @Req() req: Request,
    @Body() body: UserNameDto,
  ): Promise<void> | HttpException {
    try {
      const data = this.userParameterSanitizer(body.username);
      return this.friendService.removeFriendByName(req.user.userId, data);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/friend/id/:id')
  @UseGuards(JwtAuthGuard)
  removeFriendById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> | HttpException {
    try {
      return this.friendService.removeFriendById(req.user.userId, id);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  /*----------------------------------
	|								block						 |
	----------------------------------*/

  @Post('/block/name')
  @UseGuards(JwtAuthGuard)
  addBlockByName(
    @Req() req: Request,
    @Body() body: UserNameDto,
  ): Promise<Block> | HttpException {
    try {
      const data = this.userParameterSanitizer(body.username);
      return this.blockService.addBlockByName(req.user.userId, data);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/block/id/:id')
  @UseGuards(JwtAuthGuard)
  addBlockById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Block> | HttpException {
    try {
      return this.blockService.addBlockById(req.user.userId, id);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/block')
  @UseGuards(JwtAuthGuard)
  findBlock(@Req() req: Request): Promise<Block[]> | HttpException {
    try {
      return this.blockService.findBlock(req.user.userId);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/block/id/:id')
  findBlockById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Block[]> | HttpException {
    try {
      return this.blockService.findBlock(id);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/block/name/:name')
  async findBlockByName(
    @Req() req: Request,
    @Param('name') name: string,
  ): Promise<Block[]> {
    try {
      const data = this.userParameterSanitizer(name);
      const user = await this.userService.findUserByName(data);
      return await this.blockService.findBlock(user.id);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/block/name')
  @UseGuards(JwtAuthGuard)
  removeBlockByName(
    @Req() req: Request,
    @Body() body: UserNameDto,
  ): Promise<void> | HttpException {
    try {
      const data = this.userParameterSanitizer(body.username);
      return this.blockService.removeBlockByName(req.user.userId, data);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/block/id/:id')
  @UseGuards(JwtAuthGuard)
  removeBlockById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> | HttpException {
    try {
      return this.blockService.removeBlockById(req.user.userId, id);
    } catch (e) {
      return new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  private userParameterSanitizer(data: string): string {
    try {
      const data1 = Sanitizer.blacklist(data, ' ');
      const data2 = Sanitizer.escape(data1);
      const data3 = Sanitizer.stripLow(data2, true);
      const data4 = Sanitizer.trim(data3, ' ');
      return data4;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
