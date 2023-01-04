import create from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameRoomProps } from '@/interfaces/GameRoomProps';
import { getJwtToken } from '@/utils/getJwtToken';

interface GameStoreProps {
  socket?: Socket;
  setSocket: (socket: Socket) => void;
  makeSocket: () => void;
  disconnectSocket: () => void;

  room: GameRoomProps[];
  setRoom: (gameRoomList: GameRoomProps[]) => void;
}

export const gameStore = create<GameStoreProps>((set, get) => ({
  socket: undefined,
  setSocket: (socket: Socket) => {
    set((state) => ({ ...state, socket }));
  },
  room: [],
  setRoom: (gameRoomList: GameRoomProps[]) => {
    set((state) => ({ ...state, gameRoomList }));
  },
  makeSocket: () => {
    const newSocket = io('ws://localhost:3000/game', {
      extraHeaders: {
        authorization: getJwtToken(),
      },
    });
    newSocket.on('connection', console.log);
    get().setSocket(newSocket);
  },
  disconnectSocket: () => {
    get().socket?.disconnect();
  },
}));
