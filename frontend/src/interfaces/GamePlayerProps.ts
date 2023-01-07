import { GameUserProps } from './GameUserProps';

export interface GamePlayerProps {
  gameOption: any;
  gameRoomName: string;
  score: string;
  touchBar: number;
  user: GameUserProps;
}
