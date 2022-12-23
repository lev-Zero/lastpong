export enum gameStatus {
  WAITINGPLAYER,
  GAMESTART,
  COUNTDOWN,
  GAMEPLAYING,
  GAMEOVER,
}

export enum BackgroundColor {
  DEFAULT = 0,
  BLUE,
  ORANGE,
}

export enum Mode {
  NONE = 0,
  SPEEDUPBALL,
  SPEEDDOWNBALL,
  SIZEUPBALL,
  SIZEDOWNBALL,
  SIZEUPTOUCHBAR,
  SIZEDOWNTOUCHBAR,
}

export enum PlayerType {
  PLAYER,
  SPECTATOR,
}

export enum GameReadyStatus {
  WAITINGOTHERPLATER,
}
