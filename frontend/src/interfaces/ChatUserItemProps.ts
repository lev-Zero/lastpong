import { UserProps } from '@/interfaces/UserProps';

export enum ChatUserStatus {
  OWNER,
  ADMINISTRATOR,
  COMMON,
}

export interface ChatUserItemProps {
  myChatUserStatus: ChatUserStatus;
  user: UserProps;
  role: ChatUserStatus;
  roomNo: number | undefined;
}
