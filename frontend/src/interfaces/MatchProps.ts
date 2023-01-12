import { UserProps } from './UserProps';

export interface MatchHistoryProps {
  user: UserProps;
  winName: string;
  winScore: number;
  loseName: string;
  loseScore: number;
}
