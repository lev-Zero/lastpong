import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { chatRoomStatus } from 'src/user/enum/status.enum';

export class ChatRoomDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @IsIn([
    chatRoomStatus.PRIVATE,
    chatRoomStatus.PROTECTED,
    chatRoomStatus.PUBLIC,
  ])
  status: number;

  @IsOptional()
  password: any;
}

export class updatePwdDto {
  @IsNumber()
  @IsNotEmpty()
  chatRoomId: number;

  password: ChatRoomPwdDto;
}

export class ChatRoomPwdDto {
  @IsNotEmpty()
  @IsString()
  oldPwd: string;

  @IsNotEmpty()
  @IsString()
  newPwd: string;
}

export class ChatRoomIdDto {
  @IsNumber()
  @IsNotEmpty()
  chatRoomId: number;
}

export class ChatRoomNameDto {
  @IsString()
  @IsNotEmpty()
  chatRoomName: string;
}

export class ChatRoomUserIdDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}

export class ChatRoomJoinDto {
  @IsNumber()
  @IsNotEmpty()
  chatRoomId: number;

  @IsOptional()
  @IsString()
  password: string;
}

export class ChatRoomleaveDto {
  @IsNumber()
  @IsNotEmpty()
  targetUserId: number;

  @IsNumber()
  @IsNotEmpty()
  chatRoomId: number;
}

export class ChatRoomMessageDto {
  @IsNumber()
  @IsNotEmpty()
  chatRoomId: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class ChatRoomIdUserIdDto {
  @IsNumber()
  @IsNotEmpty()
  chatRoomId: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}

export class ChatRoomDmDto {
  @IsNumber()
  @IsNotEmpty()
  targetId: number;
}

export class ChatRoomIdDmDto {
  @IsNumber()
  @IsNotEmpty()
  chatRoomId: number;
}

export class ChatRoomDmUserIdDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}

export class ChatRoomleaveDmDto {
  @IsNumber()
  @IsNotEmpty()
  targetUserId: number;

  @IsNumber()
  @IsNotEmpty()
  chatRoomId: number;
}

export class ChatRoomDmMessageDto {
  @IsNumber()
  @IsNotEmpty()
  chatRoomId: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class InviteUserDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}

export class ResponseInviteDto {
  @IsNumber()
  @IsNotEmpty()
  hostId: number;

  @IsNumber()
  @IsNotEmpty()
  targetId: number;

  @IsString()
  @IsNotEmpty()
  randomInviteRoomName: string;

  @IsNotEmpty()
  response: boolean;
}

export class InviteGameRoomInfoDto {
  @IsNumber()
  @IsNotEmpty()
  hostId: number;

  @IsNumber()
  @IsNotEmpty()
  targetId: number;

  @IsString()
  @IsNotEmpty()
  randomInviteRoomName: string;

  @IsString()
  @IsNotEmpty()
  inviteGameRoomName: string;
}
