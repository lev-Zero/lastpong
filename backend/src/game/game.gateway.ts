import { HttpException, HttpStatus } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';
import { User } from 'src/user/entity/user.entity';
import { userStatus } from 'src/user/enum/status.enum';
import { UserService } from 'src/user/service/user.service';
import { GamePlayerDto, GameRoomNameDto, ReadyGameOptionDto, TouchBarDto } from './dto/game.dto';
import { gameStatus, PlayerType } from './enum/game.enum';
import { GameService } from './game.service';

@WebSocketGateway({namespace:'game', cors:true})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
		private readonly gameService: GameService
	) { }

	@WebSocketServer()
	public server: any;

	/* --------------------------
	|				handleConnection 		|
	|				handleDisconnect		|
	---------------------------*/

	async handleConnection(socket: Socket) {
		try {
			const user = await this.authService.findUserByRequestToken(socket);
			if (!user)
				return socket.disconnect();

			await this.userService.updateStatus(user.id, userStatus.INGAMEROOM)

			socket.data.user = user;

			socket.emit('connection', { message: `${user.username} 연결`, user })

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}
	async handleDisconnect(socket: any) {
		try {
			const user = socket.data.user;
			if (!user)
				throw new HttpException('소켓 연결 유저 없습니다.', HttpStatus.BAD_REQUEST);

			let data = { gameRoomName: "게임룸" }
			await this.exitGameRoom(socket, data);

			await this.userService.updateStatus(user.id, userStatus.ONLINE)

			socket.emit('disconnection', { message: `${user.username} 연결해제` })


		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	/* --------------------------
	|				findGameRooms 		|
	---------------------------*/

	@SubscribeMessage('findGameRooms')
	findGameRooms(socket: Socket): void {
		try {
			let gameRooms = this.gameService.findGameRooms()

			let result = [];

			for (const gameroomKey of gameRooms.keys()) {
				result.push(gameRooms.get(gameroomKey))
			}

			socket.emit('findGameRooms', { gameRoom: result })
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}


	/* --------------------------
	|				createGameRoom 		|
	|				joinGameRoom		|
	|				readyGame		|
	|				startGame		|
	|				exitGameRoom		|
	---------------------------*/

	@SubscribeMessage('createGameRoom')
	createGameRoom(socket: Socket, data: GameRoomNameDto): void {
		try {
			const user = socket.data.user;
			if (!user)
				throw new HttpException('소켓 연결 유저 없습니다.', HttpStatus.BAD_REQUEST);

			let gameRoom = this.gameService.findGameRoom(data.gameRoomName)
			if (gameRoom)
				throw new HttpException('이미 존재하는 게임룸 입니다', HttpStatus.BAD_REQUEST);

			gameRoom = this.gameService.createGameRoom(data.gameRoomName)
			if (!gameRoom)
				throw new HttpException('게임룸 생성 실패했습니다.', HttpStatus.BAD_REQUEST);

			socket.emit('createGameRoom', { message: `${data.gameRoomName} 게임룸이 생성되었습니다.`, gameRoom })

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}


	@SubscribeMessage('joinGameRoom')
	joinGameRoom(socket: Socket, data: GameRoomNameDto): void {
		try {
			const user: User = socket.data.user;
			if (!user)
				throw new HttpException('소켓 연결 유저 없습니다.', HttpStatus.BAD_REQUEST);

			let gameRoom = this.gameService.findGameRoom(data.gameRoomName)
			if (!gameRoom)
				throw new HttpException('존재하지 않는 게임룸 입니다', HttpStatus.BAD_REQUEST);

			for (const player of gameRoom.players) {
				if (player.user.username == socket.data.user.username)
					throw new HttpException('이미 참여중인 게임룸입니다.', HttpStatus.BAD_REQUEST);
			}

			let result = this.gameService.joinGameRoom(socket, gameRoom);
			socket.join(result.gameRoom.gameRoomName)

			if (result.user == PlayerType.PLAYER) {
				this.server.to(gameRoom.gameRoomName).emit('joinGameRoom', { message: `${data.gameRoomName} 게임룸에 ${user.username} 플레이어가 들어왔습니다.`, gameRoom })
			} else if (result.user == PlayerType.SPECTATOR) {
				this.server.to(gameRoom.gameRoomName).emit('joinGameRoom', { message: `${data.gameRoomName} 게임룸에 ${user.username} 관찰자가 들어왔습니다.`, gameRoom })
			} else {
				throw new HttpException('PlayerType이 정의되지 않은 유저 입니다.', HttpStatus.BAD_REQUEST);
			}


		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	@SubscribeMessage('readyGame')
	async readyGame(socket: Socket, data: ReadyGameOptionDto): Promise<void> {
		try {
			const user = socket.data.user;
			if (!user)
				throw new HttpException('소켓 연결 유저 없습니다.', HttpStatus.BAD_REQUEST);
			const player = this.gameService.findPlayerInGameRoom(user.id, data.gameRoomName)
			if (!player)
				throw new HttpException(`${data.gameRoomName}에 해당 플레이어가 없습니다.`, HttpStatus.BAD_REQUEST);

			const gameRoom = this.gameService.readyGame(data.gameRoomName, player, data.gameOption);

			if (!gameRoom) {
				this.server.to(data.gameRoomName).emit('wait', { message: `다른 유저를 기다리는 중입니다.` });
			} else {
				this.server.to(gameRoom.gameRoomName).emit('readyGame', {
					message: `양 쪽 유저 게임 준비 완료`,
					gameRoomOptions: gameRoom.facts,
					players: gameRoom.players.map((player) => player.user)
				}
				);
			}

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	@SubscribeMessage('startGame')
	async startGame(socket: Socket, data: GameRoomNameDto): Promise<void> {
		try {
			const user = socket.data.user;
			if (!user)
				throw new HttpException('소켓 연결 유저 없습니다.', HttpStatus.BAD_REQUEST);

			const player = this.gameService.findPlayerInGameRoom(user.id, data.gameRoomName)
			if (!player)
				throw new HttpException(`${data.gameRoomName}에 해당 플레이어는 없습니다.`, HttpStatus.BAD_REQUEST);

			let gameRoom = this.gameService.findGameRoom(player.gameRoomName)
			if (!gameRoom)
				throw new HttpException('존재하지 않는 게임룸 입니다', HttpStatus.BAD_REQUEST);

			let ballPosition;
			if (gameRoom.gameStatus == gameStatus.COUNTDOWN) {
				ballPosition = this.gameService.resetBallPosition(gameRoom)
				gameRoom.gameStatus = gameStatus.GAMEPLAYING
			} else {
				;
			}

			if (!ballPosition)
				throw new HttpException('게임 시작 전 공셋팅에 실패했습니다.', HttpStatus.BAD_REQUEST);

			this.server.to(gameRoom.gameRoomName).emit('ball', { message: "ball position", ballPosition })

			gameRoom.gameStatus = gameStatus.GAMEPLAYING

			let score: number[];

			if (gameRoom.gameStatus == gameStatus.GAMEPLAYING) {
				let interval = setInterval(() => {
					if (gameRoom.gameStatus != gameStatus.GAMEPLAYING) {
						clearInterval(interval)
					}

					score = this.gameService.updateScore(gameRoom)
					if (score)
						this.server.to(gameRoom.gameRoomName).emit('score', { message: "score", score })

					this.gameService.isGameOver(gameRoom, this.server, socket)

					ballPosition = this.gameService.updateBallPositionAfterTouchBar(gameRoom)
					if (ballPosition)
						this.server.to(gameRoom.gameRoomName).emit('ball', { message: "ball position", ballPosition })

					ballPosition = this.gameService.updateBallPositionAferTouchTopOrBottom(gameRoom)
					if (ballPosition)
						this.server.to(gameRoom.gameRoomName).emit('ball', { message: "ball position", ballPosition })

					ballPosition = this.gameService.updateBallPositionAndVelocity(
						gameRoom.playing.ball.position.x
						, gameRoom.playing.ball.position.y
						, gameRoom
					)
					if (ballPosition)
						this.server.to(gameRoom.gameRoomName).emit('ball', { message: "ball position", ballPosition })


				}, 30)
			} else {
				gameRoom.gameStatus = gameStatus.COUNTDOWN;

				throw new HttpException('게임 시작 전 GAMEPLAYING 문제 발생했습니다.', HttpStatus.BAD_REQUEST);
			}

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}

	}


	@SubscribeMessage('exitGameRoom')
	async exitGameRoom(socket: Socket, data: GameRoomNameDto) {

		try {
			const user: User = socket.data.user;
			if (!user)
				throw new HttpException('소켓 연결 유저 없습니다.', HttpStatus.BAD_REQUEST);

			let gameRoom = this.gameService.findGameRoom(data.gameRoomName)
			if (!gameRoom)
				throw new HttpException('존재하지 않는 게임룸 입니다', HttpStatus.BAD_REQUEST);


			const player: GamePlayerDto = this.gameService.findPlayerInGameRoom(user.id, data.gameRoomName);

			const spectator: GamePlayerDto = this.gameService.findSpectatorInGameRoom(user.id, data.gameRoomName);

			if (player || spectator) {

				await this.gameService.exitGameRoom(this.server, socket)

				if (player)
					this.server.to(gameRoom.gameRoomName).emit('exitGameRoom', { message: `${player.user.username}가 게임룸에서 나갑니다.` })
				if (spectator)
					this.server.to(gameRoom.gameRoomName).emit('exitGameRoom', { message: `관찰자가 게임룸에서 나갑니다.` })
				socket.emit('exitGameRoom', { message: `게임룸에서 나왔습니다.` })
			} else {
				throw new HttpException('해당룸에 당신은 존재하지 않습니다.', HttpStatus.BAD_REQUEST);
			}


		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}

	}


	/* --------------------------
	|				randomGameMatch 		|
	---------------------------*/

	@SubscribeMessage('randomGameMatch')
	async randomGameMatching(socket: Socket): Promise<void> {
		try {
			const user: User = socket.data.user;
			if (!user)
				throw new HttpException('소켓 연결 유저 없습니다.', HttpStatus.BAD_REQUEST);

			const gameRoomName = await this.gameService.randomGameMatching(socket);

			if (gameRoomName) {
				this.server.to(gameRoomName).emit('randomGameMatch', { message: "랜덤 매칭 된 룸 이름입니다.", gameRoomName })

			}

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}

	}


	/* --------------------------
	|				touchBar 		|
	---------------------------*/


	@SubscribeMessage('touchBar')
	updatetouchBar(socket: Socket, value: TouchBarDto, data: GameRoomNameDto): void {
		try {
			const user: User = socket.data.user;
			if (!user)
				throw new HttpException('소켓 연결 유저 없습니다.', HttpStatus.BAD_REQUEST);

			let gameRoom = this.gameService.findGameRoom(data.gameRoomName)
			if (!gameRoom)
				throw new HttpException('존재하지 않는 게임룸 입니다', HttpStatus.BAD_REQUEST);

			const player: GamePlayerDto = this.gameService.findPlayerInGameRoom(socket.data.user.id, data.gameRoomName);
			if (!player)
				throw new HttpException('해당룸에 플레이어는 존재하지 않습니다.', HttpStatus.BAD_REQUEST);

			player.touchBar = value.touchBar * gameRoom.facts.display.height;
			this.server.to(gameRoom.gameRoomName).emit('touchBar', { message: "touchBar", player: player.user.id, touchBar: value.touchBar })

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}

	}

}