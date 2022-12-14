import create from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameRoomProps } from '@/interfaces/GameRoomProps';
import { facts } from '@/interfaces/GameOptionsProps';
import { getJwtToken } from '@/utils/getJwtToken';
import { WS_SERVER_URL } from '@/utils/variables';
import { GameBall } from '@/interfaces/GameRoomProps';
import { GameUserProps } from '@/interfaces/GameUserProps';
import Router from 'next/router';
import { chatStore } from './chatStore';
interface GameStoreProps {
  gameSocket?: Socket;
  setSocket: (gameSocket: Socket | undefined) => void;
  makeSocket: () => void;
  disconnectSocket: () => void;

  isSetting: number;
  setIsSetting: (isSetting: number) => void;
  isCreated: number;
  setIsCreated: (isCreated: number) => void;
  isReady: number;
  setIsReady: (isReady: number) => void;
  isFinished: number;
  setIsFinished: (isFinished: number) => void;
  GameBall: GameBall;
  setGameBall: (GameBall: GameBall) => void;
  GameMeProps?: GameUserProps;
  setGameMeProps: (GameMeProps: GameUserProps | undefined) => void;
  leftTouchBar: number;
  setLeftTouchBar: (leftTouchBar: number) => void;
  rightTouchBar: number;
  setRightTouchBar: (rightTouchBar: number) => void;
  GameScore: number[];
  setGameScore: (GameScore: number[]) => void;
  room: GameRoomProps;
  setRoom: (gameRoomList: GameRoomProps) => void;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const gameStore = create<GameStoreProps>((set, get) => ({
  gameSocket: undefined,
  setSocket: (gameSocket: Socket | undefined) => {
    set((state) => ({ ...state, gameSocket: gameSocket }));
  },

  isSetting: 0,
  setIsSetting: (isSetting: number) => {
    set((state) => ({ ...state, isSetting: isSetting }));
  },

  isCreated: 0,
  setIsCreated: (isCreated: number) => {
    set((state) => ({ ...state, isCreated: isCreated }));
  },

  isReady: 0,
  setIsReady: (isReady: number) => {
    set((state) => ({ ...state, isReady: isReady }));
  },

  isFinished: 0,
  setIsFinished: (isFinished: number) => {
    set((state) => ({ ...state, isFinished: isFinished }));
  },

  GameMeProps: undefined,
  setGameMeProps: (GameMeProps: GameUserProps | undefined) => {
    set((state) => ({ ...state, GameMeProps: GameMeProps }));
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
        speed: 0, // ????????? ???????????? ????????? ??????
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
    newSocket.on('connection', (data) => {
      newSocket.on('randomGameMatch', async function (data) {
        const temp_room: GameRoomProps = await data.gameRoom;
        await console.log(`Ramdom Game Maching`);
        await get().setRoom(temp_room);
        sleep(300).then(() => {
          get().setIsSetting(1);
        });
      });

      newSocket.on('readyGame', async function (data) {
        await console.log(`READY GAME!`);
        await get().setRoom(data.gameRoom);
        sleep(300).then(() => {
          get().setIsReady(1);
        });
      });

      newSocket.on('joinGameRoom', ({ gameRoom }) => {
        get().setRoom(gameRoom);
      });

      newSocket.on('wait', (data) => {
        console.log('WAIT :');
        console.log(data);
      });

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

      newSocket.on('gameOver', (data) => {
        get().setIsFinished(1);
      });

      newSocket.on('createGameRoom', async (data) => {
        console.log('CREATE GAME ROOM');
        await get().setRoom(data.gameRoom);
        sleep(300).then(() => {
          get().setIsCreated(1);
        });
      });

      newSocket.on('joinGameRoom', async (data) => {
        console.log('JOIN GAME ROOM');
        await get().setRoom(data.gameRoom);
        chatStore.getState().setIsInvited(0);
        sleep(300).then(() => {
          get().setIsSetting(1);
        });
      });
    });
    newSocket.on('disconnection', () => {
      console.log('socket is disconnected!!!!');
    });
    newSocket.emit('connection');
    get().setSocket(newSocket);
  },

  disconnectSocket: () => {
    console.log('SOCKET ME : DISCONNECTING');
    const tempSocket = get().gameSocket;
    if (tempSocket !== undefined) tempSocket.disconnect();
    get().setSocket(undefined);
  },
}));
