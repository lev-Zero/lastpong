import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Blacklist, Escape, StripLow, Trim } from 'class-sanitizer';

export class UserNameDto {
  @IsString()
  @Blacklist('\n')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  username: string;
}

export class UserMatchDto {
  @IsNumber()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  winnerId: number;

  @IsNumber()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  loserId: number;

  @IsNumber()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  winnerScore: number;

  @IsNumber()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  loserScore: number;
}

export class UserUpdateNameDto {
  @IsString()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  newUserName: string;
}
