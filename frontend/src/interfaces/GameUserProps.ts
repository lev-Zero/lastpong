export enum UserStatus {
  OFFLINE,
  ONLINE,
  INGAME,
}

export interface GameUserProps {
  id: number;
  rating: number;
  status?: UserStatus;
  username: string;
  username42: string;
}
