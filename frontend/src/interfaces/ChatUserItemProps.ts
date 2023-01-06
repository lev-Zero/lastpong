import { UserProps } from '@/interfaces/UserProps';
import { Socket } from 'socket.io';
import { ChatRoomProps } from './ChatRoomProps';

export enum ChatUserStatus {
  OWNER,
  ADMINISTRATOR,
  COMMON,
}

export interface ChatUserItemProps {
  user: UserProps;
  role: ChatUserStatus;
  isFriend?: boolean;
  isMuted?: boolean;
  isBanned?: boolean;
}
