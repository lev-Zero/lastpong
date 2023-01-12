import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UserNameDto {
  @IsString()
  username: string;
}

export class UserMatchDto {
  @IsNumber()
  winnerId: number;

  @IsNumber()
  loserId: number;

  @IsNumber()
  winnerScore: number;

  @IsNumber()
  loserScore: number;
}

export class UserUpdateNameDto {
  @IsString()
  @IsNotEmpty()
  newUserName: string;
}

export class UserMatchIdDto {
  @IsNumber()
  @IsNotEmpty()
  winnerId: number;

  @IsNumber()
  @IsNotEmpty()
  loserId: number;
}
