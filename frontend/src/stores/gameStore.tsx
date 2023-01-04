import create from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameRoomProps } from '@/interfaces/GameRoomProps';
import { GameOptionsProps } from '@/interfaces/GameOptionsProps';
import { getJwtToken } from '@/utils/getJwtToken';

interface GameStoreProps {
  socket?: Socket;
  setSocket: (socket: Socket | undefined) => void;
  makeSocket: () => void;
  disconnectSocket: () => void;
  gameRoomName: string;
  setGameRoomName: (gameRoomName: string) => void;
  room: GameRoomProps;
  setRoom: (gameRoomList: GameRoomProps) => void;
}

export const gameStore = create<GameStoreProps>((set, get) => ({
  socket: undefined,
  setSocket: (socket: Socket | undefined) => {
    set((state) => ({ ...state, socket }));
  },
  room: {
    code: '',
    state: 0,
    players: [],
    spectators: [], //?
    options: {
      display: {
        width: 1920,
        height: 1080,
      },
      ball: {
        speed: 0,
        radius: 15,
      },
      tray: {
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
    ball: {
      position: {
        x: 1920 / 2,
        y: 1080 / 2,
      },
      velocity: {
        x: 0,
        y: 0,
      },
    },
    speed: 0, // 사용자 입장에서 쓸모가 없음
  },
  setRoom: (gameRoomList: GameRoomProps) => {
    set((state) => ({ ...state, gameRoomList }));
  },

  makeSocket: () => {
    const newSocket = io('ws://localhost:3000/game', {
      extraHeaders: {
        authorization: getJwtToken(),
      },
    });
    newSocket.on('connection', () => {
      newSocket.on('randomGameMatch', function (data) {
        get().setGameRoomName(data.gameRoomName);
      });
    });
    newSocket.on('disconnection', () => {
      console.log('socket is disconnected!!!');
    });
    get().setSocket(newSocket);
  },

  disconnectSocket: () => {
    const tempSocket = get().socket;
    if (tempSocket !== undefined) tempSocket.disconnect();
    get().setSocket(undefined);
  },

  gameRoomName: 'none',
  setGameRoomName: (gameRoomName) =>
    set((state) => ({
      ...state,
      gameRoomName,
    })),
}));
