import create from "zustand";
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
        this.name = "";
        this.imgUrl = "";
        this.status = 1;
        this.rating = 0;
        this.winCnt = 0;
        this.loseCnt = 0;
        this.useOtp = true;
    }
}

interface userDataInfo {
    userData: UserProps;
    setUserData: (select: UserProps) => void;
}

export const userStore = create<userDataInfo>((set) => ({
    userData: new UserProps(),
    setUserData: (select: UserProps) => {
        set((state) => ({ ...state, userData: select }));
    },
}));

// export const userStore = create<UserProps>((set) => ({
//     userData : {
//         name: "",
//         imgUrl: "",
//         status: 1,
//         rating: 0,
//         winCnt: 0,
//         loseCnt: 0,
//         useOtp: true,
//     }
//     setUserData: (select : UserProps) => {
//         set((state) => ({ ...state, userData : select }));
//     },
// }));
