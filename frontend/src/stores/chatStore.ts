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

  InviteData: GameInviteProps;
  setInviteData: (InviteData: GameInviteProps) => void;

  isInvited: number;
  setIsInvited: (isInvited: number) => void;
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
        console.log('createInviteRoom ON');
        console.log(data);
      });
      newSocket.on('requestInvite', async (data) => {
        console.log('requestInvite ON');

        await get().setInviteData(data);
        if (userStore.getState().me.id === data.hostId) {
          await get().setIsInvited(2);
        } else {
          await get().setIsInvited(1);
        }
      });
      newSocket.on('responseInvite', (data) => {
        console.log('responseInvite ON');

        console.log(data);
      });
      newSocket.on('responseInviteToHost', async (data) => {
        console.log('responseInviteToHost ON');

        if (data.response === false) get().setIsInvited(0);
        else {
          get().setIsInvited(3);
          await get().setInviteData(data);
          console.log(get().InviteData);
        }
      });
      newSocket.onAny((data) => {
        console.log('ANY DATA : ');
        console.log(data);
      });
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
  InviteData: {
    randomInviteRoomName: '',
    hostId: 0,
    targetId: 0,
  },
  setInviteData: (InviteData: GameInviteProps) => {
    set((state) => ({ ...state, InviteData: InviteData }));
  },

  isInvited: 0,
  setIsInvited: (isInvited: number) => {
    set((state) => ({ ...state, isInvited: isInvited }));
  },
}));
