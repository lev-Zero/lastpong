export enum UserStatus {
  offline,
  online,
  inGame,
}

export interface UserProps {
  id?: number;
  name: string;
  imgUrl: string;
  status?: UserStatus;
  rating: number;
}
