export interface GameInviteProps {
  randomInviteRoomName: string;
  hostId: number;
  targetId: number;
}

export async function convertGameInviteProps({
  message,
  randomInviteRoomName,
  hostId,
  targetId,
  response,
}: any): Promise<GameInviteProps> {
  return {
    randomInviteRoomName,
    hostId,
    targetId,
  };
}
