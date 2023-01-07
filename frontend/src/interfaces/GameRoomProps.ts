import { GamePlayerProps } from './GamePlayerProps';
import { facts } from './GameOptionsProps';
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
  speed: number;
  velocity: Position;
}

interface GamePlayingProps {
  ball: Ball;
}

export interface GameRoomProps {
  //facts
  facts: facts;
  gameRoomName: string;
  gameStatus: number;
  players: GamePlayerProps[];
  playing: GamePlayingProps;
  spectators?: Array<Socket>; //?
}
