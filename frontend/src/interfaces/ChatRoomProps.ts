import { UserProps } from '@/interfaces/UserProps';

export enum ChatRoomStatus {
  PUBLIC,
  PROTECTED,
  PRIVATE, // DM
}

export interface ChatRoomProps {
  name: string;
  status: ChatRoomStatus;
  mutedUsers: UserProps[];
  bannedUsers: UserProps[];
  joinedUsers: UserProps[];
  adminUsers: UserProps[];
  owner: UserProps;
}
