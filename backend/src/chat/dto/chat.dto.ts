import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { chatRoomStatus } from 'src/user/enum/status.enum';
import { Blacklist, Escape, StripLow, Trim } from 'class-sanitizer';

export class ChatRoomDto {
  @IsString()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Transform(({ value }) => value.trim())
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @IsIn([
    chatRoomStatus.PRIVATE,
    chatRoomStatus.PROTECTED,
    chatRoomStatus.PUBLIC,
  ])
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  status: number;

  @IsOptional()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  password: any;
}

export class updatePwdDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  chatRoomId: number;

  password: ChatRoomPwdDto;
}

export class ChatRoomPwdDto {
  @IsNotEmpty()
  @IsString()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  oldPwd: string;

  @IsNotEmpty()
  @IsString()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  newPwd: string;
}

export class ChatRoomIdDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  chatRoomId: number;
}

export class ChatRoomNameDto {
  @IsString()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  chatRoomName: string;
}

export class ChatRoomUserIdDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  userId: number;
}

export class ChatRoomJoinDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  chatRoomId: number;

  @IsOptional()
  @IsString()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  password: string;
}

export class ChatRoomleaveDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  targetUserId: number;

  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  chatRoomId: number;
}

export class ChatRoomMessageDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  chatRoomId: number;

  @IsString()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  message: string;
}

export class ChatRoomIdUserIdDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  chatRoomId: number;

  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  userId: number;
}

export class ChatRoomDmDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  targetId: number;
}

export class ChatRoomIdDmDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  chatRoomId: number;
}

export class ChatRoomDmUserIdDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  userId: number;
}

export class ChatRoomleaveDmDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  targetUserId: number;

  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  chatRoomId: number;
}

export class ChatRoomDmMessageDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  chatRoomId: number;

  @IsString()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  message: string;
}

export class InviteUserDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  userId: number;
}

export class ResponseInviteDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  hostId: number;

  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  targetId: number;

  @IsString()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  randomInviteRoomName: string;

  @IsNotEmpty()
  @IsBoolean()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  response: boolean;
}

export class InviteGameRoomInfoDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  hostId: number;

  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  targetId: number;

  @IsString()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  randomInviteRoomName: string;

  @IsString()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  inviteGameRoomName: string;
}

export class ChatLogDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  chatRoomId: number;

  @IsString()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  message: string;

  @IsDate()
  createdAt: Date;
}

export class ChatDmLogDto {
  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  chatRoomDmId: number;

  @IsString()
  @Blacklist('\n')
  @Blacklist(',')
  @Blacklist(' ')
  @Escape()
  @StripLow(true)
  @Trim()
  message: string;

  @IsDate()
  createdAt: Date;
}
