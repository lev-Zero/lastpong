import create from 'zustand';
// import { UserProps, UserStatus } from "@/interfaces/UserProps";

export enum UserStatus {
  online,
  offline,
  inGame,
}

class UserProps {
  name: string;
  imgUrl: string;
  status?: UserStatus;
  rating: number;
  winCnt: number;
  loseCnt: number;
  useOtp: boolean;

  constructor() {
    this.name = '';
    this.imgUrl = '';
    this.status = 1;
    this.rating = 0;
    this.winCnt = 0;
    this.loseCnt = 0;
    this.useOtp = true;
  }
}

interface userDataInfo {
  user: UserProps;
  setUser: (select: UserProps) => void;
}

export const userStore = create<userDataInfo>((set) => ({
  user: new UserProps(),
  setUser: (select: UserProps) => {
    set((state) => ({ ...state, user: select }));
  },
}));
