import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { User } from 'src/user/entity/user.entity';
import { gameStatus, Mode, BackgroundColor } from '../enum/game.enum';

export class GameRoomDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  gameRoomName: string;

  @IsNumber()
  @IsNotEmpty()
  @IsIn([
    gameStatus.COUNTDOWN,
    gameStatus.GAMEOVER,
    gameStatus.GAMEPLAYING,
    gameStatus.GAMESTART,
    gameStatus.WAITINGPLAYER,
  ])
  gameStatus: number;
  players: Array<GamePlayerDto>;
  spectators: Array<number>;
  facts: FactsDto;
  playing: PlayingDto;
}

export class PlayingDto {
  ball: BallPosVelDto;
}

export class GamePlayerDto {
  user: User;

  @IsString()
  @IsNotEmpty()
  gameRoomName: string;

  gameOption: gameOptionDto;

  @IsNumber()
  @IsNotEmpty()
  touchBar: number;

  @IsNumber()
  @IsNotEmpty()
  score: number;
}

export class gameOptionDto {
  @IsNumber()
  @IsNotEmpty()
  @IsIn([BackgroundColor.DEFAULT, BackgroundColor.BLUE, BackgroundColor.ORANGE])
  backgroundColor: number;

  @IsNumber()
  @IsNotEmpty()
  @IsIn([
    Mode.NONE,
    Mode.SIZEUPBALL,
    Mode.SIZEDOWNBALL,
    Mode.SIZEUPTOUCHBAR,
    Mode.SIZEDOWNTOUCHBAR,
    Mode.SPEEDUPBALL,
    Mode.SPEEDDOWNBALL,
  ])
  mode: number;
}

export class PositionDto {
  @IsNumber()
  @IsNotEmpty()
  x: number;

  @IsNumber()
  @IsNotEmpty()
  y: number;
}

class BallPosVelDto {
  position: PositionDto;

  velocity: PositionDto;

  @IsNumber()
  @IsNotEmpty()
  speed: number;
}

class DisplayDto {
  @IsNumber()
  @IsNotEmpty()
  width: number;

  @IsNumber()
  @IsNotEmpty()
  height: number;
}

class BallSpeedRadiusDto {
  @IsNumber()
  @IsNotEmpty()
  speed: number;

  @IsNumber()
  @IsNotEmpty()
  radius: number;
}

class touchBarDto {
  @IsNumber()
  @IsNotEmpty()
  width: number;

  @IsNumber()
  @IsNotEmpty()
  height: number;

  @IsNumber()
  @IsNotEmpty()
  x: number;
}

class ScoreDto {
  @IsNumber()
  @IsNotEmpty()
  y: number;

  @IsNumber()
  @IsNotEmpty()
  max: number;
}

export class FactsDto {
  display: DisplayDto;
  ball: BallSpeedRadiusDto;
  touchBar: touchBarDto;
  score: ScoreDto;
  gameOption: gameOptionDto;
}

export class GameRoomNameDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  gameRoomName: string;
}

export class ReadyGameOptionDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  gameRoomName: string;

  @IsNumber()
  @IsNotEmpty()
  @IsIn([BackgroundColor.DEFAULT, BackgroundColor.BLUE, BackgroundColor.ORANGE])
  backgroundColor: number;

  @IsNumber()
  @IsNotEmpty()
  @IsIn([
    Mode.NONE,
    Mode.SIZEUPBALL,
    Mode.SIZEDOWNBALL,
    Mode.SIZEUPTOUCHBAR,
    Mode.SIZEDOWNTOUCHBAR,
    Mode.SPEEDUPBALL,
    Mode.SPEEDDOWNBALL,
  ])
  mode: number;
}

export class TouchBarDto {
  @IsNumber()
  @IsNotEmpty()
  touchBar: number;

  @IsString()
  @IsNotEmpty()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  gameRoomName: string;
}
