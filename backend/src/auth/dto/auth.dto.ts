import { IsNumber, IsString } from 'class-validator';

export class User42Dto {
  @IsNumber()
  userId?: number;

  @IsString()
  username?: string;

  @IsString()
  profileUrl?: string;

  @IsString()
  accessToken42?: string;
}

export class CodeDto {
  @IsString()
  code: string;
}
