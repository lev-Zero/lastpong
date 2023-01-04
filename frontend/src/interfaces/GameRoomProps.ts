import { GamePlayerProps } from './GamePlayerProps';
import { GameOptionsProps } from './GameOptionsProps';
import { Socket } from 'socket.io';

export enum State {
  WAITING,
  STARTING,
  COUNTDOWN,
  INGAME,
  END,
}

export interface Position {
  x: number;
  y: number;
}

interface Ball {
  position: Position;
  velocity: Position;
}

export interface GameRoomProps {
  code: string;
  state: State;
  players: GamePlayerProps[];
  spectators?: Array<Socket>; //?
  options: GameOptionsProps;
  ball: Ball;
  speed: number; // 사용자 입장에서 쓸모가 없음
}
