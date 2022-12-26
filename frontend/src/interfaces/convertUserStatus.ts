import { UserStatus } from './UserProps';

export function convertUserStatus(userStatus: number) {
  // offline | online | chatChannel | chatRoom | gameChannel | gameRoom
  if (userStatus === 0) {
    return UserStatus.offline;
  } else if (userStatus <= 3) {
    return UserStatus.online;
  } else {
    return UserStatus.inGame;
  }
}
