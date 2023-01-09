import { Body, HttpException, HttpStatus } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Sanitizer } from 'class-sanitizer';
import { validate } from 'class-validator';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';
import { User } from 'src/user/entity/user.entity';
import { userStatus } from 'src/user/enum/status.enum';
import { UserService } from 'src/user/service/user.service';
import {
  GamePlayerDto,
  GameRoomNameDto,
  ReadyGameOptionDto,
  TouchBarDto,
} from './dto/game.dto';
import { gameStatus, PlayerType } from './enum/game.enum';
import { GameService } from './game.service';

const socket_username = {};

@WebSocketGateway({ namespace: 'game', cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly gameService: GameService,
  ) {}

  @WebSocketServer()
  public server: any;

  /* --------------------------
	|				handleConnection 		|
	|				handleDisconnect		|
	---------------------------*/

  async handleConnection(
    @ConnectedSocket() socket: Socket,
  ): Promise<void | WsException> {
    try {
      const user = await this.authService.findUserByRequestToken(socket);
      if (!user) {
        socket.disconnect();
        throw new WsException('소켓 연결 유저 없습니다.');
      }

      // await this.userService.updateStatus(user.id, userStatus.GAMECHANNEL);
      await this.userService.updateStatus(user.id, userStatus.INGAME);

      socket.data.user = user;
      socket_username[user.username] = socket;
      this.gameService.removeSocketInQueue(socket);
      socket.emit('connection', { message: `${user.username} 연결`, user });
    } catch (e) {
      return new WsException(e.message);
    }
  }
  async handleDisconnect(
    @ConnectedSocket() socket: Socket,
  ): Promise<void | WsException> {
    try {
      const user = socket.data.user;
      if (!user) throw new WsException('소켓 연결 유저 없습니다.');

      const gameRoomName = this.gameService.findGameRoomOfUser(user.id);
      if (gameRoomName) await this.exitGameRoom(socket, { gameRoomName });

      await this.userService.updateStatus(user.id, userStatus.ONLINE);

      this.gameService.removeSocketInQueue(socket);
      socket.emit('disconnection', { message: `${user.username} 연결해제` });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  /* --------------------------
	|				findGameRooms 		|
	---------------------------*/

  @SubscribeMessage('findGameRooms')
  findGameRooms(@ConnectedSocket() socket: Socket): void | WsException {
    try {
      const gameRooms = this.gameService.findGameRooms();

      const result = [];

      for (const gameroomKey of gameRooms.keys()) {
        result.push(gameRooms.get(gameroomKey));
      }

      socket.emit('findGameRooms', { gameRoom: result });
    } catch (e) {
      return new WsException(e.message);
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
  createGameRoom(@ConnectedSocket() socket: Socket): void | WsException {
    try {
      const user = socket.data.user;
      if (!user) throw new WsException('소켓 연결 유저 없습니다.');

      const randomRoomName = String(Math.floor(Math.random() * 1e9));

      let gameRoom = this.gameService.findGameRoom(randomRoomName);
      if (gameRoom) throw new WsException('이미 존재하는 게임룸 입니다');

      gameRoom = this.gameService.createGameRoom(randomRoomName);
      if (!gameRoom) throw new WsException('게임룸 생성 실패했습니다.');

      socket.emit('createGameRoom', {
        message: `${randomRoomName} 게임룸이 생성되었습니다.`,
        gameRoom,
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  @SubscribeMessage('joinGameRoom')
  async joinGameRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: GameRoomNameDto,
  ): Promise<void | WsException> {
    try {
      const validBody = await this.gameParameterValidation(
        body,
        GameRoomNameDto,
      );
      const data = this.gameParameterSanitizer(validBody.gameRoomName);
      validBody.gameRoomName = data;

      const user: User = socket.data.user;
      if (!user) throw new WsException('소켓 연결 유저 없습니다.');

      const gameRoom = this.gameService.findGameRoom(validBody.gameRoomName);
      if (!gameRoom) throw new WsException('존재하지 않는 게임룸 입니다');

      for (const player of gameRoom.players) {
        if (player.user.username == socket.data.user.username)
          throw new WsException('이미 참여중인 게임룸입니다.');
      }

      const result = this.gameService.joinGameRoom(socket, gameRoom);
      socket.join(result.gameRoom.gameRoomName);

      if (result.user == PlayerType.PLAYER) {
        this.server.to(gameRoom.gameRoomName).emit('joinGameRoom', {
          message: `${validBody.gameRoomName} 게임룸에 ${user.username} 플레이어가 들어왔습니다.`,
          gameRoom,
        });
      } else if (result.user == PlayerType.SPECTATOR) {
        this.server.to(gameRoom.gameRoomName).emit('joinGameRoom', {
          message: `${validBody.gameRoomName} 게임룸에 ${user.username} 관찰자가 들어왔습니다.`,
          gameRoom,
        });
      } else {
        throw new WsException('PlayerType이 정의되지 않은 유저 입니다.');
      }

      // await this.userService.updateStatus(user.id, userStatus.GAMEROOM);
      await this.userService.updateStatus(user.id, userStatus.INGAME);
    } catch (e) {
      return new WsException(e.message);
    }
  }

  @SubscribeMessage('readyGame')
  async readyGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: ReadyGameOptionDto,
  ): Promise<void | WsException> {
    try {
      const validBody = await this.gameParameterValidation(
        body,
        ReadyGameOptionDto,
      );
      const data = this.gameParameterSanitizer(validBody.gameRoomName);
      validBody.gameRoomName = data;

      const user = socket.data.user;
      if (!user) throw new WsException('소켓 연결 유저 없습니다.');
      const player = this.gameService.findPlayerInGameRoom(
        user.id,
        validBody.gameRoomName,
      );
      if (!player)
        throw new WsException(
          `${validBody.gameRoomName}에 해당 플레이어가 없습니다.`,
        );

      const gameRoom = this.gameService.readyGame(
        validBody.gameRoomName,
        player,
        validBody.backgroundColor,
        validBody.mode,
      );

      if (!gameRoom) {
        this.server
          .to(validBody.gameRoomName)
          .emit('wait', { message: `다른 유저를 기다리는 중입니다.` });
      } else {
        // this.server.to(gameRoom.gameRoomName).emit('readyGame', {
        //   message: `양 쪽 유저 게임 준비 완료`,
        //   gameRoomOptions: gameRoom.facts,
        //   players: gameRoom.players.map((player) => player.user),
        // });
        this.server.to(gameRoom.gameRoomName).emit('readyGame', {
          message: `양 쪽 유저 게임 준비 완료`,
          gameRoom: gameRoom,
        });
      }
    } catch (e) {
      return new WsException(e.message);
    }
  }

  @SubscribeMessage('startGame')
  async startGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: GameRoomNameDto,
  ): Promise<void | WsException> {
    try {
      const validBody = await this.gameParameterValidation(
        body,
        GameRoomNameDto,
      );
      const data = this.gameParameterSanitizer(validBody.gameRoomName);
      validBody.gameRoomName = data;

      const user = socket.data.user;
      if (!user) throw new WsException('소켓 연결 유저 없습니다.');

      const player = this.gameService.findPlayerInGameRoom(
        user.id,
        validBody.gameRoomName,
      );
      if (!player)
        throw new WsException(
          `${validBody.gameRoomName}에 해당 플레이어는 없습니다.`,
        );

      const gameRoom = this.gameService.findGameRoom(player.gameRoomName);
      if (!gameRoom) throw new WsException('존재하지 않는 게임룸 입니다');

      let ballPosition;
      if (gameRoom.gameStatus == gameStatus.COUNTDOWN) {
        ballPosition = this.gameService.resetBallPosition(gameRoom);
        gameRoom.gameStatus = gameStatus.GAMEPLAYING;
      } else {
      }

      if (!ballPosition)
        throw new WsException('게임 시작 전 공셋팅에 실패했습니다.');

      this.server
        .to(gameRoom.gameRoomName)
        .emit('ball', { message: 'ball position', ballPosition });

      gameRoom.gameStatus = gameStatus.GAMEPLAYING;

      let score: number[];

      if (gameRoom.gameStatus == gameStatus.GAMEPLAYING) {
        const interval = setInterval(() => {
          if (gameRoom.gameStatus != gameStatus.GAMEPLAYING) {
            clearInterval(interval);
          }

          score = this.gameService.updateScore(gameRoom);
          if (score)
            this.server
              .to(gameRoom.gameRoomName)
              .emit('score', { message: 'score', score });

          this.gameService.isGameOver(gameRoom, this.server, socket);

          ballPosition =
            this.gameService.updateBallPositionAfterTouchBar(gameRoom);
          if (ballPosition)
            this.server
              .to(gameRoom.gameRoomName)
              .emit('ball', { message: 'ball position', ballPosition });

          ballPosition =
            this.gameService.updateBallPositionAferTouchTopOrBottom(gameRoom);
          if (ballPosition)
            this.server
              .to(gameRoom.gameRoomName)
              .emit('ball', { message: 'ball position', ballPosition });

          ballPosition = this.gameService.updateBallPositionAndVelocity(
            gameRoom.playing.ball.position.x,
            gameRoom.playing.ball.position.y,
            gameRoom,
          );
          if (ballPosition)
            this.server
              .to(gameRoom.gameRoomName)
              .emit('ball', { message: 'ball position', ballPosition });
        }, 30);
      } else {
        gameRoom.gameStatus = gameStatus.COUNTDOWN;

        throw new WsException('게임 시작 전 GAMEPLAYING 문제 발생했습니다.');
      }
    } catch (e) {
      return new WsException(e.message);
    }
  }

  @SubscribeMessage('exitGameRoom')
  async exitGameRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: GameRoomNameDto,
  ): Promise<void | WsException> {
    try {
      const validBody = await this.gameParameterValidation(
        body,
        GameRoomNameDto,
      );
      const data = this.gameParameterSanitizer(validBody.gameRoomName);
      validBody.gameRoomName = data;

      const user: User = socket.data.user;
      if (!user) throw new WsException('소켓 연결 유저 없습니다.');

      const gameRoom = this.gameService.findGameRoom(validBody.gameRoomName);
      if (!gameRoom) throw new WsException('존재하지 않는 게임룸 입니다');

      const player: GamePlayerDto = this.gameService.findPlayerInGameRoom(
        user.id,
        validBody.gameRoomName,
      );

      const spectator: number = this.gameService.findSpectatorInGameRoom(
        user.id,
        validBody.gameRoomName,
      );

      if (player || spectator) {
        await this.gameService.exitGameRoom(this.server, socket);

        if (player)
          this.server.to(gameRoom.gameRoomName).emit('exitGameRoom', {
            message: `${player.user.username}가 게임룸에서 나갑니다.`,
          });
        if (spectator)
          this.server
            .to(gameRoom.gameRoomName)
            .emit('exitGameRoom', { message: `관찰자가 게임룸에서 나갑니다.` });
        socket.emit('exitGameRoom', { message: `게임룸에서 나왔습니다.` });
        // await this.userService.updateStatus(user.id, userStatus.GAMECHANNEL);
        await this.userService.updateStatus(user.id, userStatus.INGAME);
      } else {
        throw new WsException('해당룸에 당신은 존재하지 않습니다.');
      }
    } catch (e) {
      return new WsException(e.message);
    }
  }

  /* --------------------------
	|				randomGameMatch 		|
	---------------------------*/

  @SubscribeMessage('randomGameMatch')
  randomGameMatching(@ConnectedSocket() socket: Socket): void | WsException {
    try {
      const user: User = socket.data.user;
      if (!user) throw new WsException('소켓 연결 유저 없습니다.');

      const gameRoom = this.gameService.randomGameMatching(socket);

      if (gameRoom) {
        this.server.to(gameRoom.gameRoomName).emit('randomGameMatch', {
          message: '랜덤 매칭 된 룸 이름입니다.',
          gameRoom,
        });
      }
    } catch (e) {
      return new WsException(e.message);
    }
  }

  /* --------------------------
	|				touchBar 		|
	|				removeSocketInQueue 		|
	---------------------------*/

  @SubscribeMessage('touchBar')
  async updatetouchBar(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: TouchBarDto,
  ): Promise<void | WsException> {
    try {
      const validBody = await this.gameParameterValidation(body, TouchBarDto);
      const data = this.gameParameterSanitizer(validBody.gameRoomName);
      validBody.gameRoomName = data;

      const user: User = socket.data.user;
      if (!user) throw new WsException('소켓 연결 유저 없습니다.');

      const gameRoom = await this.gameService.findGameRoom(
        validBody.gameRoomName,
      );
      if (!gameRoom) throw new WsException('존재하지 않는 게임룸 입니다');

      const player: GamePlayerDto = await this.gameService.findPlayerInGameRoom(
        socket.data.user.id,
        validBody.gameRoomName,
      );
      if (!player)
        throw new WsException('해당룸에 플레이어는 존재하지 않습니다.');

      player.touchBar = validBody.touchBar;
      this.server.to(gameRoom.gameRoomName).emit('touchBar', {
        message: 'touchBar',
        player: player.user.id,
        touchBar: validBody.touchBar,
      });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  @SubscribeMessage('removeSocketInQueue')
  removeSocketInQueue(@ConnectedSocket() socket): WsException | null {
    try {
      this.removeSocketInQueue(socket);
      socket.emit('removeSocketInQueue', { message: 'removeSocketInQueue' });
    } catch (e) {
      return new WsException(e.message);
    }
  }

  private gameParameterSanitizer(data: string) {
    try {
      const data1 = Sanitizer.blacklist(data, ' ');
      const data2 = Sanitizer.escape(data1);
      const data3 = Sanitizer.stripLow(data2, true);
      const data4 = Sanitizer.trim(data3, ' ');
      return data4;
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  private async gameParameterValidation(body: any, type: any) {
    try {
      const data = new type();
      for (const key of Object.keys(body)) {
        data[key] = body[key];
      }

      const res = await validate(data);
      if (res.length > 0) {
        const errorArray = { error: [] };
        for (const e of res) {
          errorArray.error.push(e.constraints);
        }
        throw new WsException(JSON.stringify(errorArray));
      } else {
        console.log('validation succeed');
      }
      return data;
    } catch (e) {
      throw new WsException(e.message);
    }
  }
}
