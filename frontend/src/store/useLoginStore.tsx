import create from "zustand";

interface LoginState {
  name: any;
  setName: (name: any) => void;
  totalWin: number;
  setTotalWin: (totalWin: number) => void;
  totalLoss: number;
  setTotalLoss: (totalLoss: number) => void;
  ladderRank: number;
  setLadderRank: (ladderRank: number) => void;
  avatarImg: any;
  setAvatarImg: (avatarImg: any) => void;
  // AUTH
}

const useLoginStore = create<LoginState>((set) => ({
  name: "TEMP",
  setName: (name) =>
    set((state) => ({
      ...state,
      name,
    })),

  totalWin: 0,
  setTotalWin: (totalWin) =>
    set((state) => ({
      ...state,
      totalWin,
    })),

  totalLoss: 0,
  setTotalLoss: (totalLoss) =>
    set((state) => ({
      ...state,
      totalLoss,
    })),

  ladderRank: 999,
  setLadderRank: (ladderRank) =>
    set((state) => ({
      ...state,
      ladderRank,
    })),

  avatarImg: "/pngegg.png",
  setAvatarImg: (avatarImg) =>
    set((state) => ({
      ...state,
      avatarImg,
    })),
}));

export default useLoginStore;
