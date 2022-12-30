import { UserProps } from '@/interfaces/UserProps';

export interface ChatRoomItemProps {
  id: number;
  title: string;
  owner: UserProps;
  isPrivate: boolean;
  password?: string;
}
