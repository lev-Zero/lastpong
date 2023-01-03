import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { User } from 'src/user/entity/user.entity';
import { gameStatus, Mode, BackgroundColor } from '../enum/game.enum';
import { Blacklist, Escape, StripLow, Trim } from 'class-sanitizer';

export class GameRoomDto {
  @IsString()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Transform(({ value }) => value.trim())
  gameRoomName: string;
  gameStatus: gameStatus;
  players;
  spectators;
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
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  gameRoomName: string;

  gameOption: gameOptionDto;

  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  touchBar: number;

  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  score: number;
}

export class gameOptionDto {
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  backgroundColor: BackgroundColor;
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  mode: Mode;
}

export class PositionDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  x: number;

  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  y: number;
}

class BallPosVelDto {
  position: PositionDto;

  velocity: PositionDto;

  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  speed: number;
}

class DisplayDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  width: number;

  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  height: number;
}

class BallSpeedRadiusDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  speed: number;

  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  radius: number;
}

class touchBarDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  width: number;

  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  height: number;

  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  x: number;
}

class ScoreDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  y: number;

  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
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
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Transform(({ value }) => value.trim())
  gameRoomName: string;
}

export class ReadyGameOptionDto {
  gameOption: gameOptionDto;

  @IsString()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Transform(({ value }) => value.trim())
  gameRoomName: string;
}

export class TouchBarDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  touchBar: number;

  @IsString()
  @IsNotEmpty()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Transform(({ value }) => value.trim())
  gameRoomName: string;
}
