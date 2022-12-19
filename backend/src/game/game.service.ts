import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/service/user.service';
import { GamePlayerDto, GameRoomDto, gameOptionDto, PositionDto } from './dto/game.dto';
import { gameStatus, Mode, BackgroundColor, PlayerType } from './enum/game.enum';
import { MatchService } from 'src/user/service/match.service';

@Injectable()
export class GameService {
	constructor(
		private readonly userService: UserService,
		private readonly matchService: MatchService
	) { }
	/* --------------------------
	|						멤버 변수   			|
	---------------------------*/

	queue: Array<Socket> = [];
	gameRooms: Map<string, GameRoomDto> = new Map();


	/* --------------------------
	|				findGameRoom			|
	|				findGameRooms			|
	|				findPlayerInGameRoom			|
	|				findSpectorInGameRoom			|
	---------------------------*/

	findGameRoom(gameRoomName: string): GameRoomDto {
		try {
			return this.gameRooms.get(gameRoomName);
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	findGameRooms() {
		try {
			return this.gameRooms
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}

	}

	findPlayerInGameRoom(userId: number, gameRoomName: string): GamePlayerDto | null {
		try {
			const gameRoom = this.gameRooms.get(gameRoomName);
			if (!gameRoom)
				throw new HttpException('존재하지 않는 게임룸 입니다', HttpStatus.BAD_REQUEST);
			for (const player of gameRoom.players) {
				if (player.user.id == userId)
					return player
			}
			return null;
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}


	findSpectatorInGameRoom(userId: number, gameRoomName: string): GamePlayerDto | null {
		const gameRoom = this.gameRooms.get(gameRoomName);
		if (!gameRoom)
			throw new HttpException('존재하지 않는 게임룸 입니다', HttpStatus.BAD_REQUEST);
		for (const spectatorId of gameRoom.spectators) {
			if (spectatorId == userId)
				return spectatorId
		}
		return null;
	}


	/* --------------------------
	|				createGameRoom			|
	|				joinGameRoom			|
	|				readyGame			|
	---------------------------*/


	createGameRoom(gameRoomName: string): GameRoomDto {
		console.log("[gameService] createGameRoom")

		try {
			const gameRoom: GameRoomDto = {
				gameRoomName,
				gameStatus: gameStatus.WAITINGPLAYER,
				players: [],
				spectators: [],
				facts: {
					display: { width: 1920, height: 1080 },
					ball: { speed: 20, radius: 20 },
					touchBar: { width: 20, height: 200, x: 50 },
					score: { y: 15, max: 10 },
					gameOption: { backgroundColor: BackgroundColor.DEFAULT, mode: Mode.NONE },
				},
				playing: {
					ball: {
						position: { x: 0, y: 0 },
						velocity: { x: 0, y: 0 },
						speed: 0
					},
				}
			};

			this.gameRooms.set(gameRoomName, gameRoom);
			return gameRoom;
		} catch (e) { throw new HttpException(e.message, HttpStatus.BAD_REQUEST); }
	}

	joinGameRoom(socket: Socket, gameRoom: GameRoomDto): { gameRoom: GameRoomDto, user: PlayerType } {
		console.log("[gameService] joinGameRoom")
		try {
			let user: PlayerType = PlayerType.SPECTATOR;
			let gamePlayer: GamePlayerDto;
			if (gameRoom.gameStatus == gameStatus.WAITINGPLAYER) {
				gamePlayer = {
					user: socket.data.user,
					gameRoomName: gameRoom.gameRoomName,
					gameOption: null,
					touchBar: gameRoom.facts.display.height / 2,
					score: 0,
				};

				gameRoom.players.push(gamePlayer);
				user = PlayerType.PLAYER;
				if (gameRoom.players.length == 2) {
					gameRoom.gameStatus = gameStatus.GAMESTART;
				}

			} else {
				if (gameRoom.gameStatus == gameStatus.GAMEPLAYING) {
					if (!gameRoom.spectators)
						gameRoom.spectators = [];
					gameRoom.spectators.push(socket.data.user.id);

				} else {
					throw new HttpException('아직 해당 게임에 참관할 수 없습니다.', HttpStatus.BAD_REQUEST);
				}
			}

			const testgameRoom = this.gameRooms.get(gameRoom.gameRoomName);

			return { gameRoom, user };
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}


	readyGame(gameRoomName: string, player: GamePlayerDto, gameOption: gameOptionDto): GameRoomDto | null {
		try {
			const gameRoom = this.gameRooms.get(gameRoomName);
			if (!gameRoom)
				throw new HttpException('존재하지 않는 게임룸 입니다', HttpStatus.BAD_REQUEST);

			const findPlayer = this.findPlayerInGameRoom(player.user.id, gameRoomName)
			if (!findPlayer)
				throw new HttpException(`${gameRoomName}에 해당 플레이어는 없습니다.`, HttpStatus.BAD_REQUEST);

			for (const player of gameRoom.players) {
				if (player.user.username == findPlayer.user.username) {
					player.gameOption = gameOption;
					break;
				}
			}

			if (gameRoom.gameStatus != gameStatus.GAMESTART) {
				return;
			}

			for (const player of gameRoom.players) {
				if (!player.gameOption) {
					return;
				}
			}

			gameRoom.gameStatus = gameStatus.COUNTDOWN;
			let selectRandomOption: number = Math.round(Math.random());
			gameRoom.facts.gameOption.backgroundColor = gameRoom.players[selectRandomOption].gameOption.backgroundColor;
			gameRoom.facts.gameOption.mode = gameRoom.players[selectRandomOption].gameOption.mode;

			if (gameRoom.facts.gameOption.mode == Mode.SPEEDUPBALL) {
				gameRoom.facts.ball.speed = 40;
			} else if (gameRoom.facts.gameOption.mode == Mode.SPEEDDOWNBALL) {
				gameRoom.facts.ball.speed = 15;
			}

			if (gameRoom.facts.gameOption.mode == Mode.SIZEUPBALL) {
				gameRoom.facts.ball.radius = 40;
			} else if (gameRoom.facts.gameOption.mode == Mode.SIZEDOWNBALL) {
				gameRoom.facts.ball.radius = 10;
			}

			if (gameRoom.facts.gameOption.mode == Mode.SIZEUPTOUCHBAR) {
				gameRoom.facts.touchBar.height = 300;
			} else if (gameRoom.facts.gameOption.mode == Mode.SIZEDOWNTOUCHBAR)
				gameRoom.facts.touchBar.height = 150;

			return gameRoom;

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}

	}



	/* --------------------------
	|			updateBallPositionAndVelocity|
	|			resetBallPosition		|
	|			updateScore
	|			updateBallPositionAfterTouchBar|
	|			updateBallPositionAferTouchTopOrBottom|
	---------------------------*/

	updateBallPositionAndVelocity(x: number, y: number, gameRoom: GameRoomDto, radian?: number,): PositionDto {

		try {
			if (radian) {
				gameRoom.playing.ball.velocity = {
					x: Math.cos(radian) * (gameRoom.playing.ball.speed *= 1.01),
					y: Math.sin(radian) * (gameRoom.playing.ball.speed *= 1.01)
				}
			}

			gameRoom.playing.ball.position.x = x + gameRoom.playing.ball.velocity.x;
			gameRoom.playing.ball.position.y = y + gameRoom.playing.ball.velocity.y;

			return gameRoom.playing.ball.position;

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}

	}

	resetBallPosition(gameRoom: GameRoomDto): PositionDto {

		try {
			let radian = (Math.random())
			let dir: string = Math.floor(Math.random() * 10) % 2 ? "odd" : "even";

			if (dir == "odd")
				radian += Math.PI;

			dir = Math.floor(Math.random() * 10) % 2 ? "odd" : "even";

			if (dir == "odd")
				radian -= Math.PI;


			gameRoom.playing.ball.speed = gameRoom.facts.ball.speed;

			const middleWidthPosition = gameRoom.facts.display.width / 2
			const middleHeightPosition = gameRoom.facts.display.height / 2

			return this.updateBallPositionAndVelocity(
				middleWidthPosition,
				middleHeightPosition,
				gameRoom,
				radian
			);
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}



	updateScore(gameRoom: GameRoomDto): number[] {
		try {
			const nextBallPositionX = gameRoom.playing.ball.position.x + gameRoom.playing.ball.velocity.x;
			const nextBallPositionY = gameRoom.playing.ball.position.y + gameRoom.playing.ball.velocity.y;

			const nextBallPosition = {
				x: nextBallPositionX,
				y: nextBallPositionY,
			};

			const ballRadius = gameRoom.facts.ball.radius
			const widthOnDisplay = gameRoom.facts.display.width

			if (
				nextBallPosition.x - ballRadius < 0 ||
				nextBallPosition.x + ballRadius > widthOnDisplay
			) {
				if (nextBallPosition.x - ballRadius < 0)
					++gameRoom.players[0].score;
				else
					++gameRoom.players[1].score;

				this.resetBallPosition(gameRoom);

				return gameRoom.players.map((player) => player.score);
			}
			return null;
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	updateBallPositionAfterTouchBar(gameRoom: GameRoomDto) {


		try {
			const nextBallPositionX = gameRoom.playing.ball.position.x + gameRoom.playing.ball.velocity.x;
			const nextBallPositionY = gameRoom.playing.ball.position.y + gameRoom.playing.ball.velocity.y;

			const nextBallPosition = {
				x: nextBallPositionX,
				y: nextBallPositionY,
			};

			const ballRadius = gameRoom.facts.ball.radius
			const widthOnDisplay = gameRoom.facts.display.width

			const touchBarHeight = gameRoom.facts.touchBar.height;

			if (!(nextBallPosition.x - ballRadius < 0 ||
				nextBallPosition.x + ballRadius > widthOnDisplay)) {

				if (gameRoom.players.length == 2) { 
					if (
					nextBallPosition.y >= gameRoom.players[0].touchBar - touchBarHeight / 2 &&
					nextBallPosition.y <= gameRoom.players[0].touchBar + touchBarHeight / 2
				) {
					if (nextBallPosition.x - ballRadius < gameRoom.facts.touchBar.x) {
						gameRoom.playing.ball.velocity.x *= -1;
						return this.updateBallPositionAndVelocity(gameRoom.playing.ball.position.x, gameRoom.playing.ball.position.y, gameRoom)
					}
				}

				if (
					nextBallPosition.y >= gameRoom.players[1].touchBar - touchBarHeight / 2 &&
					nextBallPosition.y <= gameRoom.players[1].touchBar + touchBarHeight / 2
				) {
					if (nextBallPosition.x + ballRadius > widthOnDisplay - gameRoom.facts.touchBar.x) {
						gameRoom.playing.ball.velocity.x *= -1;
						return this.updateBallPositionAndVelocity(gameRoom.playing.ball.position.x, gameRoom.playing.ball.position.y, gameRoom)
					}
				}
			}
			}
			return null;

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}


	updateBallPositionAferTouchTopOrBottom(gameRoom: GameRoomDto) {
		try {
			const nextBallPositionX = gameRoom.playing.ball.position.x + gameRoom.playing.ball.velocity.x;
			const nextBallPositionY = gameRoom.playing.ball.position.y + gameRoom.playing.ball.velocity.y;

			const nextBallPosition = {
				x: nextBallPositionX,
				y: nextBallPositionY,
			};

			const ballRadius = gameRoom.facts.ball.radius
			const heightOnDisplay = gameRoom.facts.display.height
			if (
				nextBallPosition.y - ballRadius < 0 ||
				nextBallPosition.y + ballRadius > heightOnDisplay
			) {
				gameRoom.playing.ball.velocity.y *= -1;

				return this.updateBallPositionAndVelocity(gameRoom.playing.ball.position.x, gameRoom.playing.ball.position.y, gameRoom)

			}
			return null
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	/* --------------------------
|			isGameOver|
|			gameOver|
|			exitGameRoom|
---------------------------*/

	isGameOver(gameRoom: GameRoomDto, server: any, socket: Socket) {
		try {
			for (const player of gameRoom.players) {
				if (player.score == gameRoom.facts.score.max) {
					if(socket.data.user.id == player.user.id)
						this.gameOver(gameRoom, player, server, socket);
				}
			}
			return null;
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}

	async gameOver(gameRoom: GameRoomDto, win: GamePlayerDto, server: any, socket: Socket) {

		try {
			let winner;
			let loser;
			if (gameRoom.gameStatus == gameStatus.GAMEPLAYING) {
				gameRoom.gameStatus = gameStatus.GAMEOVER;

				if (gameRoom.players.length == 2 && socket.data.user.id == win.user.id) {

					winner = win.user;

					loser = gameRoom.players.find(
						(player1) => player1.user.id != win.user.id,
					).user;

					let winnerScore;
					let loserScore;

					for (const player of gameRoom.players) {
						if (player.user.id == winner.id)
							winnerScore = player.score;
						if (player.user.id == loser.id)
							loserScore = player.score
					}
					await this.matchService.updateRank(winner, loser);

					const matchResult = {
						winnerId: winner.id, loserId: loser.id,
						winnerScore, loserScore,
					};
					await this.matchService.addMatch(matchResult);

					server.to(gameRoom.gameRoomName).emit('gameOver', { message: "gameOver", winner, loser })
				}
			}
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
		}
	}


	async exitGameRoom(server: any, socket: Socket): Promise<any> {

		try {
			const userId = socket.data.user.id
			if (this.queue.indexOf(userId) != -1) {
				this.queue.splice(this.queue.indexOf(userId), 1);
			}

			for (const gameRoom of this.gameRooms.values()) {
				if (gameRoom.spectators && gameRoom.spectators.indexOf(userId) != -1) {
					socket.leave(gameRoom.gameRoomName);
					return gameRoom.spectators.splice(gameRoom.spectators.indexOf(userId), 1);
				}

				for (const player of gameRoom.players) {
					if (player.user.id == userId) {
						await this.gameOver(
							gameRoom,
							gameRoom.players.find((player1) => player1.user.id != player.user.id),
							server,
							socket
						);
						socket.leave(gameRoom.gameRoomName);
						gameRoom.gameStatus = gameStatus.WAITINGPLAYER;
						gameRoom.players.splice(gameRoom.players.indexOf(player), 1);
						break;
					}
				}
				if (!gameRoom.players.length)
					return this.gameRooms.delete(gameRoom.gameRoomName);
			}
		} catch (e) { 
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST); }

	}



	/* --------------------------
|				randomGameMatching			|
|				isPlayerInAnyGameRoom			|
---------------------------*/

	randomGameMatching(socket: Socket): string {
		try {

			if (this.queue.find((playerSockets) => playerSockets == socket)) {
				throw new HttpException('이미 queue에서 다른 유저 기다리는 중입니다', HttpStatus.BAD_REQUEST);
			}
			if (this.isPlayerInAnyGameRoom(socket.data.user.id)) {
				throw new HttpException('이미 다른 게임룸에 참여중입니다.', HttpStatus.BAD_REQUEST);
			}

			this.queue.push(socket);

			if (this.queue.length < 2) {
				throw new HttpException('다른 유저를 기다리는 중입니다.', HttpStatus.BAD_REQUEST);
				return;
			}

			const randomRoomName = String(Math.floor(Math.random() * 1e9));
			const gameRoom: GameRoomDto = this.createGameRoom(randomRoomName);

			while (this.queue.length && gameRoom.players.length < 2) {
				const seletedSocket = this.queue.shift();
				this.joinGameRoom(seletedSocket, gameRoom);
				seletedSocket.join(randomRoomName)
			}
			return gameRoom.gameRoomName

		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
		}
	}


	isPlayerInAnyGameRoom(MyId: number): GamePlayerDto {
		try {
			for (const gameRoom of this.gameRooms.values()) {
				for (const player of gameRoom.players) {
					if (player.user.id == MyId)
						return player;
				}
			}
			return null;
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
		}
	}
}