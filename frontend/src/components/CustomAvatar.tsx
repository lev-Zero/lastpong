import { UserStatus } from '@/interfaces/UserProps';
import { Avatar, AvatarBadge } from '@chakra-ui/react';

interface CustomAvatarProps {
  url: string;
  size: string;
  status?: UserStatus;
  style?: Object;
}

function getBg(status: UserStatus) {
  switch (status) {
    case UserStatus.online:
      return 'online';
    case UserStatus.inGame:
      return 'inGame';
    default:
      return 'offline';
  }
}

export default function CustomAvatar({ url, size, status, style }: CustomAvatarProps) {
  return (
    <Avatar src={url} size={size} style={style} bg="gray.200" objectFit="cover">
      {status !== undefined ? <AvatarBadge bg={getBg(status)} boxSize="1.25em" /> : null}
    </Avatar>
  );
}
