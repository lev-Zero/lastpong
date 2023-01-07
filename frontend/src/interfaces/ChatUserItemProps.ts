import { UserProps } from '@/interfaces/UserProps';

export enum ChatUserStatus {
  OWNER,
  ADMIN,
  COMMON,
}

export interface ChatUserItemProps {
  myChatUserStatus: ChatUserStatus;
  user: UserProps;
  role: ChatUserStatus;
  roomNo: number | undefined;
}
