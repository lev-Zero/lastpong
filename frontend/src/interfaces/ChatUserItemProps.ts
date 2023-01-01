import { UserProps } from '@/interfaces/UserProps';

export enum ChatUserStatus {
  OWNER,
  ADMINISTRATOR,
  COMMON,
}

export interface ChatUserItemProps {
  user: UserProps;
  role: ChatUserStatus;
}
