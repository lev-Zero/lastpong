import { ChatRoomItemProps } from '@/interfaces/ChatRoomItemProps';
import { getJwtToken } from '@/utils/getJwtToken';
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
}

export const chatStore = create<ChatStoreProps>((set, get) => ({
  socket: undefined,
  setSocket: (socket: Socket) => {
    set((state) => ({ ...state, socket }));
  },
  makeSocket: () => {
    const newSocket = io('ws://localhost:3000/chat', {
      extraHeaders: {
        authorization: getJwtToken(),
      },
    });
    newSocket.on('connection', console.log);
    newSocket.on('chatRoomAll', (res) => {
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
            isPrivate: chatRoom.status === 2,
            password: '',
          };
        })
      );
    });
    newSocket.on('join', console.log);
    get().setSocket(newSocket);
  },
  chatRoomList: [],
  refreshChatRoomList: () => get().socket?.emit('chatRoomAll'),
  setChatRoomList: (chatRoomList: ChatRoomItemProps[]) => {
    set((state) => ({ ...state, chatRoomList }));
  },

  // setUseOtp: (useOtp: boolean) => {
  //   set((state) => ({ ...state, useOtp }));
}));
