import { IsNumber, IsString } from 'class-validator';

export class user42Dto {
  @IsNumber()
  id: number;

  @IsString()
  username: string;

  @IsString()
  profileUrl: string;
}

export class CodeDto {
  @IsString()
  code: string;
}
