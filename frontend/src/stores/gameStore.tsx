import create from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameRoomProps } from '@/interfaces/GameRoomProps';
import { facts } from '@/interfaces/GameOptionsProps';
import { getJwtToken } from '@/utils/getJwtToken';
import { WS_SERVER_URL } from '@/utils/variables';
import { GameBall } from '@/interfaces/GameRoomProps';
import Router from 'next/router';
interface GameStoreProps {
  socket?: Socket;
  setSocket: (socket: Socket | undefined) => void;
  makeSocket: () => void;
  isReady: number;
  setIsReady: (isReady: number) => void;
  isFinished: number;
  setIsFinished: (isReady: number) => void;
  GameBall: GameBall;
  setGameBall: (GameBall: GameBall) => void;
  disconnectSocket: () => void;

  leftTouchBar: number;
  setLeftTouchBar: (leftTouchBar: number) => void;
  rightTouchBar: number;
  setRightTouchBar: (leftTouchBar: number) => void;
  GameScore: number[];
  setGameScore: (GameScore: number[]) => void;
  room: GameRoomProps;
  setRoom: (gameRoomList: GameRoomProps) => void;
}

export const gameStore = create<GameStoreProps>((set, get) => ({
  socket: undefined,
  setSocket: (socket: Socket | undefined) => {
    set((state) => ({ ...state, socket: socket }));
  },
  isReady: 0,
  setIsReady: (isReady: number) => {
    set((state) => ({ ...state, isReady: isReady }));
  },
  isFinished: 0,
  setIsFinished: (isFinished: number) => {
    set((state) => ({ ...state, isFinished: isFinished }));
  },

  leftTouchBar: 0,
  setLeftTouchBar: (leftTouchBar: number) => {
    set((state) => ({ ...state, leftTouchBar: leftTouchBar }));
  },
  rightTouchBar: 0,
  setRightTouchBar: (rightTouchBar: number) => {
    set((state) => ({ ...state, rightTouchBar: rightTouchBar }));
  },

  GameBall: {
    x: 0,
    y: 0,
  },
  setGameBall: (GameBall: GameBall) => {
    set((state) => ({ ...state, GameBall: GameBall }));
  },
  GameScore: [0, 0],
  setGameScore: (GameScore: number[]) => {
    set((state) => ({ ...state, GameScore: GameScore }));
  },
  room: {
    facts: {
      display: {
        width: 1920,
        height: 1080,
      },
      ball: {
        speed: 0,
        radius: 15,
      },
      touchBar: {
        width: 20,
        height: 200,
        x: 50,
      },
      score: {
        y: 10,
        max: 15,
      },
      gameOption: {
        backgroundColor: 0,
        mode: 0,
      },
    },
    gameRoomName: '',
    gameStatus: 0,
    players: [],
    playing: {
      ball: {
        position: {
          x: 0,
          y: 0,
        },
        speed: 0, // 사용자 입장에서 쓸모가 없음
        velocity: {
          x: 0,
          y: 0,
        },
      },
    },
    spectators: [], //?
  },
  setRoom: (gameRoomList: GameRoomProps) => {
    set((state) => ({ ...state, room: gameRoomList }));
  },

  makeSocket: () => {
    const newSocket = io(`http://localhost:3000/game`, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      extraHeaders: {
        authorization: getJwtToken(),
      },
    });
    newSocket.on('connection', (data) => {
      newSocket.on('randomGameMatch', async function (data) {
        const temp_room: GameRoomProps = await data.gameRoom;
        await console.log(`Ramdom Game Maching`);
        await console.log(temp_room);
        await get().setRoom(temp_room);
        await console.log(`ROOM : `);
        await console.log(get().room);
      });
      newSocket.on('readyGame', async function (data) {
        const temp_room: GameRoomProps = await data.gameRoom;
        await console.log(`READY GAME!`);
        await console.log(temp_room);
        await get().setRoom(temp_room);
        await console.log(`ROOM : `);
        await console.log(get().room);
        await get().setIsReady(1);
      });

      newSocket.on('wait', (data) => {
        console.log('WAIT :');
        console.log(data);
      });

      newSocket.on('ball', (data) => {
        get().setGameBall(data.ballPosition);
      });

      newSocket.on('touchBar', (data) => {
        // console.log(get().room.players[0].user.id);
        // console.log(get().room.players[1].user.id);
        console.log(data.player);
        console.log(data.touchBar);

        if (get().room.players[0].user.id === data.player) {
          console.log('LEFT');
          get().setLeftTouchBar(data.touchBar);
        }
        if (get().room.players[1].user.id === data.player) {
          console.log('RIGHT');
          get().setRightTouchBar(data.touchBar);
        }
      });

      newSocket.on('score', (data) => {
        get().setGameScore(data.score);
      });

      newSocket.onAny((data) => {
        console.log('ANY DATA : ');
        console.log(data);
      });
    });
    newSocket.on('disconnection', () => {
      console.log('socket is disconnected!!!!');
    });
    newSocket.emit('connection');
    get().setSocket(newSocket);
  },

  disconnectSocket: () => {
    const tempSocket = get().socket;
    if (tempSocket !== undefined) tempSocket.disconnect();
    get().setSocket(undefined);
  },
}));
