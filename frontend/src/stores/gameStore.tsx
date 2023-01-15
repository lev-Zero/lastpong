import create from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameRoomProps } from '@/interfaces/GameRoomProps';
import { getJwtToken } from '@/utils/getJwtToken';
import { WS_SERVER_URL } from '@/utils/variables';
import { GameBall } from '@/interfaces/GameRoomProps';
import { GameUserProps } from '@/interfaces/GameUserProps';
import { chatStore } from './chatStore';
import { sleep } from '@/utils/sleep';

interface GameStoreProps {
  socket?: Socket;
  setSocket: (socket: Socket | undefined) => void;
  makeSocket: () => void;

  isCreated: number;
  setIsCreated: (isCreated: number) => void;
  gameBall: GameBall;
  setGameBall: (GameBall: GameBall) => void;
  gameMeProps?: GameUserProps;
  setGameMeProps: (GameMeProps: GameUserProps | undefined) => void;
  leftTouchBar: number;
  setLeftTouchBar: (leftTouchBar: number) => void;
  rightTouchBar: number;
  setRightTouchBar: (rightTouchBar: number) => void;
  gameScore: number[];
  setGameScore: (GameScore: number[]) => void;
  room: GameRoomProps;
  setRoom: (gameRoomList: GameRoomProps) => void;
  isSetting: boolean;
  setIsSetting: (isSetting: boolean) => void;
}

export const gameStore = create<GameStoreProps>((set, get) => ({
  socket: undefined,
  setSocket: (socket: Socket | undefined) => {
    set((state) => ({ ...state, socket }));
  },

  isCreated: 0,
  setIsCreated: (isCreated: number) => {
    set((state) => ({ ...state, isCreated }));
  },

  gameMeProps: undefined,
  setGameMeProps: (gameMeProps: GameUserProps | undefined) => {
    set((state) => ({ ...state, gameMeProps }));
  },

  leftTouchBar: 0,
  setLeftTouchBar: (leftTouchBar: number) => {
    set((state) => ({ ...state, leftTouchBar }));
  },
  rightTouchBar: 0,
  setRightTouchBar: (rightTouchBar: number) => {
    set((state) => ({ ...state, rightTouchBar }));
  },

  gameBall: {
    x: 0,
    y: 0,
  },
  setGameBall: (gameBall: GameBall) => {
    set((state) => ({ ...state, gameBall }));
  },
  gameScore: [0, 0],
  setGameScore: (gameScore: number[]) => {
    set((state) => ({ ...state, gameScore }));
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
    const newSocket = io(`${WS_SERVER_URL}/game`, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 100,
      reconnectionDelayMax: 500,
      extraHeaders: {
        authorization: getJwtToken(),
      },
    });
    newSocket.on('connection', console.log);
    newSocket.on('joinGameRoom', (res) => {
      // 관찰자가 들어왔다는 메시지는 isSetting으로 가도록 하면 안됨
      if (res.message.includes('관찰자')) {
        return;
      }
      get().setRoom(res.gameRoom);
      chatStore.getState().setIsInvited(0);
      sleep(500).then(() => {
        get().setIsSetting(true);
      });
    });
    newSocket.on('wait', console.log);
    newSocket.on('ball', (data) => {
      get().setGameBall(data.ballPosition);
    });
    newSocket.on('touchBar', (data) => {
      if (get().room.players.length !== 2) {
        console.log('players are not 2 people');
        return;
      }

      if (get().room.players[0].user.id === data.player) {
        get().setLeftTouchBar(data.touchBar);
      }
      if (get().room.players[1].user.id === data.player) {
        get().setRightTouchBar(data.touchBar);
      }
    });
    newSocket.on('score', (data) => {
      get().setGameScore(data.score);
    });
    newSocket.on('createGameRoom', async (res) => {
      await get().setRoom(res.gameRoom);
      sleep(500).then(() => get().setIsCreated(1));
    });
    newSocket.on('disconnection', console.log);

    get().setSocket(newSocket);
  },
  isSetting: false,
  setIsSetting: (isSetting: boolean) => {
    set((state) => ({ ...state, isSetting }));
  },
}));
