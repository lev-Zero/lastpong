import create from 'zustand';

interface GameStoreProps {
  p1Name: any;
  setP1Name: (p1Name: any) => void;

  p1Score: number;
  setP1Score: (p2Score: number) => void;

  p2Name: any;
  setP2Name: (p2Name: any) => void;
  p2Score: number;
  setP2Score: (p2Score: number) => void;

  ballPosX: number;
  setBallPosX: (ballPosX: number) => void;

  ballPosY: number;
  setBallPosY: (ballPosY: number) => void;

  paddle1PosY: number;
  setPaddle1PosY: (paddle1PosY: number) => void;

  paddle2PosY: number;
  setPaddle2PosY: (paddle2PosY: number) => void;
}

export const gameStore = create<GameStoreProps>((set) => ({
  p1Name: 'Player1',
  setP1Name: (p1Name) =>
    set((state) => ({
      ...state,
      p1Name,
    })),

  p2Name: 'Player2',
  setP2Name: (p2Name) =>
    set((state) => ({
      ...state,
      p2Name,
    })),

  p1Score: 0,
  setP1Score: (p1Score) =>
    set((state) => ({
      ...state,
      p1Score,
    })),

  p2Score: 0,
  setP2Score: (p2Score) =>
    set((state) => ({
      ...state,
      p2Score,
    })),

  ballPosX: 700,
  setBallPosX: (ballPosX) =>
    set((state) => ({
      ...state,
      ballPosX,
    })),

  ballPosY: 400,
  setBallPosY: (ballPosY) =>
    set((state) => ({
      ...state,
      ballPosY,
    })),

  paddle1PosY: 800 / 2 - 50,
  setPaddle1PosY: (paddle1PosY) =>
    set((state) => ({
      ...state,
      paddle1PosY,
    })),

  paddle2PosY: 800 / 2 - 50,
  setPaddle2PosY: (paddle2PosY) =>
    set((state) => ({
      ...state,
      paddle2PosY,
    })),
}));
