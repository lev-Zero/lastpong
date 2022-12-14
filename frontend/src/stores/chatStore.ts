import { DmMsgProps } from './../interfaces/MsgProps';
import { UserProps } from '@/interfaces/UserProps';
import { userStore } from './userStore';
import { ChatRoomItemProps } from '@/interfaces/ChatRoomItemProps';
import { ChatRoomStatus } from '@/interfaces/ChatRoomProps';
import { getJwtToken } from '@/utils/getJwtToken';
import { WS_SERVER_URL } from '@/utils/variables';
import { useRouter } from 'next/router';
import { io, Socket } from 'socket.io-client';

import create from 'zustand';
import { GameInviteProps, convertGameInviteProps } from '@/interfaces/GameInviteProps';
import { gameStore } from './gameStore';

interface ChatStoreProps {
  socket?: Socket;
  setSocket: (socket: Socket) => void;
  makeSocket: () => void;
  refreshChatRoomList: () => void;
  chatRoomList: ChatRoomItemProps[];
  setChatRoomList: (chatRoomList: ChatRoomItemProps[]) => void;
  giveAdmin: (chatRoomId: number | undefined, userId: number) => void;
  removeAdmin: (chatRoomId: number | undefined, userId: number) => void;
  muteUser: (chatRoomId: number | undefined, userId: number) => void;
  removeMute: (chatRoomId: number | undefined, userId: number) => void;
  addBan: (chatRoomId: number | undefined, userId: number) => void;
  dmMsgList: DmMsgProps[];
  addDmMsg: (username: string, targetUsername: string, text: string) => void;

  InviteData: GameInviteProps | undefined;
  setInviteData: (InviteData: GameInviteProps) => void;

  isInvited: number;
  setIsInvited: (isInvited: number) => void;

  dmIdxMap: Map<string, number>;
  updateDmIdxMap: (targetName: string, lastIdx: number) => void;

  roomNo: number | undefined;
  updateRoomNo: (roomNo: number) => void;
  resetRoomNo: () => void;
}

export const chatStore = create<ChatStoreProps>((set, get) => ({
  socket: undefined,
  setSocket: (socket: Socket) => {
    set((state) => ({ ...state, socket }));
  },

  makeSocket: () => {
    const newSocket = io(`${WS_SERVER_URL}/chat`, {
      extraHeaders: {
        authorization: getJwtToken(),
      },
    });

    newSocket.on('connection', (data) => {
      newSocket.on('createInviteRoom', (data) => {
        console.log('ON CHAT : createInviteRoom');
        console.log(data);
      });
      newSocket.on('requestInvite', async (data) => {
        console.log('ON CHAT : requestInvite');
        await get().setInviteData(data);
        console.log('INVITE DATA');
        console.log(get().InviteData);

        sleep(300).then(() => {
          if (userStore.getState().me.id === data.hostId) {
            get().setIsInvited(2);
          } else {
            get().setIsInvited(1);
          }
        });
      });
      newSocket.on('responseInvite', (data) => {
        console.log('ON CHAT : responseInvite');
        console.log(data);
      });
      newSocket.on('responseInviteToHost', async (data) => {
        console.log(data);
        console.log('ON CHAT : responseInviteToHost');
        if (data.response === false) {
          console.log('FALSE RESPONSE');
          sleep(300).then(() => {
            get().setIsInvited(0);
          });
        } else {
          if (userStore.getState().me.id === data.hostId) {
            sleep(300).then(() => {
              get().setIsInvited(3);
              get().setInviteData(data);
            });
          }
        }
      });

      function sleep(ms: number) {
        return new Promise((r) => setTimeout(r, ms));
      }
      newSocket.on('inviteGameRoomInfo', (data) => {
        console.log('ON CHAT : inviteGameRoomInfo');
        sleep(500).then(() => {
          if (
            gameStore.getState().gameSocket !== undefined &&
            gameStore.getState().gameSocket?.connected === true
          ) {
            console.log('EMIT GAME : joinGameRoom');
            gameStore.getState().gameSocket?.emit('joinGameRoom', {
              gameRoomName: data.gameRoomName,
            });
          }
        });
      });

      // newSocket.onAny((data) => {
      //   console.log('ANY DATA : ');
      //   console.log(data);
      // });
    });
    get().setSocket(newSocket);
  },
  chatRoomList: [],
  refreshChatRoomList: () => {
    get().socket?.once('chatRoomAll', (res) => {
      const allChatRoom = res.chatRoom;
      get().setChatRoomList(
        allChatRoom.map((chatRoom: any) => {
          return {
            id: chatRoom.id,
            title: chatRoom.name,
            owner: {
              name: chatRoom.owner.username,
              imgUrl: '',
              status: chatRoom.owner.status,
              rating: chatRoom.owner.rating,
            },
            isProtected: chatRoom.status === ChatRoomStatus.PROTECTED,
          };
        })
      );
    });
    get().socket?.emit('chatRoomAll');
  },
  setChatRoomList: (chatRoomList: ChatRoomItemProps[]) => {
    set((state) => ({ ...state, chatRoomList }));
  },
  giveAdmin: (chatRoomId: number | undefined, userId: number) => {
    const socket = get().socket;

    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (chatRoomId === undefined) {
      console.log('chatRoomId is undefined');
      return;
    }
    socket.emit('addAdmin', { chatRoomId, userId });
  },

  removeAdmin: (chatRoomId: number | undefined, userId: number) => {
    const socket = get().socket;

    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (chatRoomId === undefined) {
      console.log('chatRoomId is undefined');
      return;
    }
    socket.emit('removeAdmin', { chatRoomId, userId });
  },

  muteUser: (chatRoomId: number | undefined, userId: number) => {
    const socket = get().socket;

    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (chatRoomId === undefined) {
      console.log('chatRoomId is undefined');
      return;
    }
    console.log('mute user');
    socket.emit('addMute', { chatRoomId, userId });
  },

  removeMute: (chatRoomId: number | undefined, userId: number) => {
    const socket = get().socket;

    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (chatRoomId === undefined) {
      console.log('chatRoomId is undefined');
      return;
    }
    console.log('remove Mute user');
    socket.emit('removeMute', { chatRoomId, userId });
  },

  addBan: (chatRoomId: number | undefined, userId: number) => {
    const socket = get().socket;

    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (chatRoomId === undefined) {
      console.log('chatRoomId is undefined');
      return;
    }
    socket.emit('addBan', { chatRoomId, userId });
  },
  dmMsgList: [],
  addDmMsg: (username: string, targetUsername: string, text: string) => {
    set((state) => ({
      ...state,
      dmMsgList: [...get().dmMsgList, { username, targetUsername, text }],
    }));
  },
  InviteData: undefined,
  setInviteData: (InviteData: GameInviteProps | undefined) => {
    set((state) => ({ ...state, InviteData: InviteData }));
  },

  isInvited: 0,
  setIsInvited: (isInvited: number) => {
    set((state) => ({ ...state, isInvited: isInvited }));
  },
  dmIdxMap: new Map<string, number>(),
  updateDmIdxMap: (targetName: string, lastIdx: number) => {
    set((state) => ({
      ...state,
      dmIdxMap: get().dmIdxMap.set(targetName, lastIdx),
    }));
  },
  roomNo: undefined,
  updateRoomNo: (roomNo: number) => {
    set((state) => ({
      ...state,
      roomNo: roomNo,
    }));
  },
  resetRoomNo: () => {
    set((state) => ({
      ...state,
      roomNo: undefined,
    }));
  },
}));
