import create from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameRoomProps } from '@/interfaces/GameRoomProps';
import { facts } from '@/interfaces/GameOptionsProps';
import { getJwtToken } from '@/utils/getJwtToken';
import { WS_SERVER_URL } from '@/utils/variables';

interface GameStoreProps {
  socket?: Socket;
  setSocket: (socket: Socket | undefined) => void;
  makeSocket: () => void;
  disconnectSocket: () => void;
  room: GameRoomProps;
  setRoom: (gameRoomList: GameRoomProps) => void;
}

export const gameStore = create<GameStoreProps>((set, get) => ({
  socket: undefined,
  setSocket: (socket: Socket | undefined) => {
    set((state) => ({ ...state, socket: socket }));
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
        await console.log(`ROOM DATA !: `);
        await console.log(temp_room);
        await get().setRoom(temp_room);
        await console.log(`ROOM : `);
        await console.log(get().room);
      });
      newSocket.on('readyGame', function (data) {
        console.log(data);
        // let temp_room: GameRoomProps = get().room;
        // temp_room.facts = data.gameRoomOptions;
        // temp_room.players[0].user = data.players[0];
        // temp_room.players[1].user = data.players[1];
        // get().setRoom(temp_room);
      });
      newSocket.on('wait', (data) => {
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
