import { UserProps } from '@/interfaces/UserProps';
import { ChatRoomItemProps } from '@/interfaces/ChatRoomItemProps';
import { ChatRoomStatus } from '@/interfaces/ChatRoomProps';
import { getJwtToken } from '@/utils/getJwtToken';
import { WS_SERVER_URL } from '@/utils/variables';
import { useRouter } from 'next/router';
import { io, Socket } from 'socket.io-client';
import create from 'zustand';

interface ChatStoreProps {
  socket?: Socket;
  setSocket: (socket: Socket) => void;
  makeSocket: () => void;
  refreshChatRoomList: () => void;
  chatRoomList: ChatRoomItemProps[];
  setChatRoomList: (chatRoomList: ChatRoomItemProps[]) => void;
  giveAdmin: (chatRoomId: number | undefined, userId: number) => void;
  removeAdmin: (chatRoomId: number | undefined, userId: number) => void;
  addBan: (chatRoomId: number | undefined, userId: number) => void;
  joinAllMyDmRoom: (friends: UserProps[]) => void;
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
  joinAllMyDmRoom: (friends: UserProps[]) => {
    const socket: Socket | undefined = get().socket;
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    socket.once('chatRoomDmMe', (res) => {
      const dmRoomList = res.chatRoomDm;
      console.log('dmRoomList', dmRoomList);
      friends.forEach((friend) => {
        socket.emit('createChatRoomDm', { targetId: friend.id }, console.log);
      });
    });
    socket.emit('chatRoomDmMe', (err: any) => {
      console.log(err);
    });
  },
}));
