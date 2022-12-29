export enum UserStatus {
  offline,
  online,
  inGame,
}

export interface UserProps {
  name: string;
  imgUrl: string;
  status?: UserStatus;
  rating: number;
}
