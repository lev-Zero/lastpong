import { UserProps } from '@/interfaces/UserProps';

export interface MatchInfoProps {
  me: UserProps;
  opp: UserProps;
  roomName?: string;
}
