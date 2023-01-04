import { IsNumber, IsString } from 'class-validator';
import { Blacklist, Escape, StripLow, Trim } from 'class-sanitizer';

export class user42Dto {
  @IsNumber()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  id: number;

  @IsString()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  username: string;

  @IsString()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  profileUrl: string;
}
