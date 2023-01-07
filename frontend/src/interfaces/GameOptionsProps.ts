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

interface TouchBar {
  height: number;
  width: number;
  x: number;
}

interface Score {
  max: number;
  y: number;
}

interface GameOption {
  backgroundColor: number;
  mode: number;
}

export interface facts {
  ball: Ball;
  display: Display;
  gameOption: GameOption;
  score: Score;
  touchBar: TouchBar;
}
