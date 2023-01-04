// export enum Plan {
//   DEFAULT = 0,
//   BLUE,
//   ORANGE,
// }

// export enum Mode {
//   NONE = 0,
//   SPEED,
//   SMALL,
// }

// export interface Input {
//   plan: Plan;
//   mode: Mode;
// }

interface Display {
  width: number;
  height: number;
}

interface Ball {
  speed: number;
  radius: number;
}

interface Tray {
  width: number;
  height: number;
  x: number;
}

interface Score {
  y: number;
  max: number;
}

interface GameOption {
  backgroundColor: number;
  mode: number;
}

export interface GameOptionsProps {
  display: Display;
  ball: Ball;
  tray: Tray;
  score: Score;
  gameOption: GameOption;
}
