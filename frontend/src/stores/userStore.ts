import exp from "constants";
import { ReactElement, ReactNode } from "react";
import create from "zustand";

interface Bears {
    bears: number;
    increasePopulation: () => void;
    removeAllBears: () => void;
}

export const useBearStore = create<Bears>((set) => ({
    bears: 0,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => set({ bears: 0 }),
}));
