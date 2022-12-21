export enum UserStatus {
  online,
  offline,
  inGame,
}

export interface UserProps {
  name: string;
  imageUrl: string;
  status: UserStatus;
  rating: number;
  winCnt: number;
  loseCnt: number;
  useOtp: boolean;
}