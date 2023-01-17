import { DmMsgProps } from './../interfaces/MsgProps';
import { userStore } from './userStore';
import { ChatRoomItemProps } from '@/interfaces/ChatRoomItemProps';
import { ChatRoomStatus } from '@/interfaces/ChatRoomProps';
import { getJwtToken } from '@/utils/getJwtToken';
import { WS_SERVER_URL } from '@/utils/variables';
import { io, Socket } from 'socket.io-client';

import create from 'zustand';
import { GameInviteProps } from '@/interfaces/GameInviteProps';
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

  inviteData: GameInviteProps | undefined;
  setInviteData: (inviteData: GameInviteProps) => void;

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

    newSocket.on('connection', console.log);
    newSocket.on('createInviteRoom', console.log);
    newSocket.on('requestInvite', (res) => {
      get().setInviteData(res);
      get().setIsInvited(userStore.getState().me.id === res.hostId ? 2 : 1);
    });
    newSocket.on('responseInvite', console.log);
    newSocket.on('responseInviteToHost', (res) => {
      if (!res.response) {
        get().setIsInvited(0);
        return;
      }
      if (userStore.getState().me.id === res.hostId) {
        get().setIsInvited(3);
        get().setInviteData(res);
      }
    });
    newSocket.on('directMessage', ({ user, targetUser, message }) => {
      console.log('on directMessage', user.username, targetUser.user.username, message);
      get().addDmMsg(user.username, targetUser.user.username, message);
    });
    newSocket.on('inviteGameRoomInfo', (res) => {
      const gameSocket: Socket | undefined = gameStore.getState().socket;
      if (gameSocket === undefined || !gameSocket.connected) {
        console.log('gameSocket is not ready');
        return;
      }
      gameSocket.emit('joinGameRoom', { gameRoomName: res.gameRoomName });
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
  inviteData: undefined,
  setInviteData: (inviteData: GameInviteProps | undefined) => {
    set((state) => ({ ...state, inviteData }));
  },

  isInvited: 0,
  setIsInvited: (isInvited: number) => {
    set((state) => ({ ...state, isInvited }));
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
