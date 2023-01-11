import { RawUserProps } from '@/utils/convertRawUserToUser';

export interface GamePlayerProps {
  gameOption: any;
  gameRoomName: string;
  score: string;
  touchBar: number;
  user: RawUserProps;
}
