import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { Match } from './entity/match.entity';
import { User } from './entity/user.entity';
import { ProfileService } from './service/profile.service';
import { UserService } from './service/user.service';

import { Request } from './interface/user.interface';

import { JwtAuthGuard } from 'src/auth/security/jwt.guard';

import { FileInterceptor } from '@nestjs/platform-express';
import { BlockService } from './service/block.service';
import { FriendService } from './service/friend.service';
import { MatchService } from './service/match.service';
import { Friend } from './entity/friend.entity';
import { Block } from './entity/block.entity';
import { UserMatchDto, UserNameDto } from './dto/user.dto';
import { Profile } from './entity/profile.entity';

@Controller('user')
export class UserController {
	constructor(
		private userService: UserService,
		private profileService: ProfileService,
		private blockService: BlockService,
		private friendService: FriendService,
		private matchService: MatchService,
	) { }

	/*----------------------------------
	|								TEST 							 |
	----------------------------------*/

	//http://localhost:3000/user/test/create/fakeuser
	@Get('/test/create/fakeuser')
	testCreateUser() {
		console.log("[userController] testCreateUser")
		this.testDeleteUser();
		this.userService.testCreateFakeUser("fake_U1")
		this.userService.testCreateFakeUser("fake_U2")
		this.userService.testCreateFakeUser("fake_U3")
		this.userService.testCreateFakeUser("fake_U4")
	}

	//http://localhost:3000/user/test/delete/fakeuser
	@Get('/test/delete/fakeuser')
	testDeleteUser() {
		console.log("[userController] testDeleteUser")
		this.userService.testDeleteFakeUser("fake_U1")
		this.userService.testDeleteFakeUser("fake_U2")
		this.userService.testDeleteFakeUser("fake_U3")
		this.userService.testDeleteFakeUser("fake_U4")
		this.userService.testDeleteFakeUser("fake_U5")
	}
	@Get('/test/read/fakeuser/:name')
	testFindUser(@Param('name') name: string) {
		console.log("[userController] testReadUser")
		let fakeuser = this.userService.testFindUser(name)
		const user = fakeuser
		return user
	}

	/*----------------------------------
	|								user 							 |
	----------------------------------*/
	@Get()
	findUserAll(): Promise<User[]> {
		return this.userService.findUserAll();
	}

	@Get('/id/:id')
	findUserById(
		@Param('id', ParseIntPipe) id: number
	): Promise<User> {
		const user = this.userService.findUserById(id,['friend']);
		return user;
	}

	@Get('/name/:name')
	findUserByName(
		@Param('name') name: string
	): Promise<User> {
		const user = this.userService.findUserByName(name);
		return user;
	}

	@Get('/me')
	@UseGuards(JwtAuthGuard)
	findMe(@Req() req: Request): Promise<User> {
		return this.userService.findUserById(req.user.userId);
	}


	/*----------------------------------
	|								profile							 |
	----------------------------------*/

	@Get('/profile/id/:userId')
	async findProfileById(
		@Param('userId', ParseIntPipe) userId: number,
		@Res({ passthrough: true }) res: Response,
	) {
		const profile = await this.profileService.findProfileById(userId);
		const data = profile.photoData.toString('base64');
		const mimeType = 'image/*';
		return `<img src="data:${mimeType};base64,${data}" />`
	}

	@Get('/profile/name/:name')
	async findProfileByName(
		@Param('name') name: string,
		@Res({ passthrough: true }) res: Response,
	) {
		const profile = await this.profileService.findProfileByName(name);
		const data = profile.photoData.toString('base64');
		const mimeType = 'image/*';
		return `<img src="data:${mimeType};base64,${data}" />`
	}

	@Get('/profile/me')
	@UseGuards(JwtAuthGuard)
	async findProfileMe(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const profile = await this.profileService.findProfileById(req.user.userId);
		const data = profile.photoData.toString('base64');
		const mimeType = 'image/*';
		return `<img src="data:${mimeType};base64,${data}" />`
	}
	
	@Put('/profile/me')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor('file'))
	updateProfile(
		@Req() req: Request,
		@UploadedFile() file: Express.Multer.File,
	): Promise<Profile> {
		return this.profileService.updateOrCreateProfile(req.user.userId, file);
	}

	@Delete('/profile/me')
	@UseGuards(JwtAuthGuard)
	deleteProfile(@Req() req: Request):Promise<void> {
		return this.profileService.deleteProfile(req.user.userId)
	}

	/*----------------------------------
	|								match							 |
  ----------------------------------*/
	
	@Get('/match/id/:id')
	findMatcheById(@Param('id', ParseIntPipe) userid: number): Promise<Match[]> {
		return this.matchService.findMatcheById(userid);
	}

	@Get('/match/name/:name')
	findMatcheByName(@Param('name') username: string): Promise<Match[]> {
		return this.matchService.findMatcheByName(username);
	}

	@Post('/match/add')
	addMatchById(@Body() body: UserMatchDto): Promise<void> { 
		return this.matchService.addMatchById(body);
	}
	
	

	/*----------------------------------
	|								friend						 |
	----------------------------------*/
	@Post('/friend/name/:name')
	@UseGuards(JwtAuthGuard)
	addFriendByName(@Req() req: Request, @Body() body: UserNameDto):Promise<Friend> { 
		return this.friendService.addFriendByName(req.user.userId ,body.username);
	}

	@Post('/friend/id/:id')
	@UseGuards(JwtAuthGuard)
	addFriendById(@Req() req: Request, @Param('id',ParseIntPipe) id: number): Promise<Friend> {
		return this.friendService.addFriendById(req.user.userId, id);
	}

	@Get('/friend')
	@UseGuards(JwtAuthGuard)
	findFriend(@Req() req: Request): Promise<Friend[]> {
		return this.friendService.findFriend(req.user.userId);
	}

	@Delete('/friend/name/:name')
	@UseGuards(JwtAuthGuard)
	removeFriendByName(@Req() req: Request, @Body() body: UserNameDto): Promise<void> {
		return this.friendService.removeFriendByName(req.user.userId, body.username);
	}

	@Delete('/friend/id/:id')
	@UseGuards(JwtAuthGuard)
	removeFriendById(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<void> {
		return this.friendService.removeFriendById(req.user.userId, id);
	}


	/*----------------------------------
	|								block						 |
	----------------------------------*/

	@Post('/block/name/:name')
	@UseGuards(JwtAuthGuard)
	addBlockByName(@Req() req: Request, @Body() body: UserNameDto): Promise<Block> {
		return this.blockService.addBlockByName(req.user.userId, body.username);
	}

	@Post('/block/id/:id')
	@UseGuards(JwtAuthGuard)
	addBlockById(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<Block> {
		return this.blockService.addBlockById(req.user.userId, id);
	}

	@Get('/block')
	@UseGuards(JwtAuthGuard)
	findBlock(@Req() req: Request): Promise<Block[]> {
		return this.blockService.findBlock(req.user.userId);
	}

	@Delete('/block/name/:name')
	@UseGuards(JwtAuthGuard)
	removeBlockByName(@Req() req: Request, @Body() body: UserNameDto): Promise<void> {
		return this.blockService.removeBlockByName(req.user.userId, body.username);
	}

	@Delete('/block/id/:id')
	@UseGuards(JwtAuthGuard)
	removeBlockById(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<void> {
		return this.blockService.removeBlockById(req.user.userId,id);
	}


}
