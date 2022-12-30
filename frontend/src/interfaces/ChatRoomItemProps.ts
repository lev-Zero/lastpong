import { UserProps } from '@/interfaces/UserProps';

interface ChatRoomItemProps {
  id: number;
  title: string;
  owner: UserProps;
  isPrivate: boolean;
  password?: string;
}
