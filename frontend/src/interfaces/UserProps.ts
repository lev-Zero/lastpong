export enum UserStatus {
  OFFLINE,
  ONLINE,
  INGAME,
}

export interface UserProps {
  id: number;
  name: string;
  imgUrl: string;
  status?: UserStatus;
  rating: number;
}
