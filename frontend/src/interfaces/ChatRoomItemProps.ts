import { UserProps } from '@/interfaces/UserProps';

export interface ChatRoomItemProps {
  id: number;
  title: string;
  owner: UserProps;
  isProtected: boolean;
  password?: string; // TODO: 삭제 예정
}
