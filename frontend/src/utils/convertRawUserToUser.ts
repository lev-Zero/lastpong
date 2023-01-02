import { UserProps, UserStatus } from '@/interfaces/UserProps';
import { avatarFetch } from './avatarFetch';

// BE에서 넘어오는 User 정보를 FE의 UserProps에 맞게 받아준다.
export interface RawUserProps {
  id: number;
  rating: number;
  status: UserStatus;
  username: string;
  username42: string | null;
}

export async function convertRawUserToUser({
  id,
  rating,
  status,
  username,
  username42,
}: RawUserProps): Promise<UserProps> {
  const imgUrl: string = await avatarFetch('GET', `/user/id/${id}`);

  return {
    id,
    name: username,
    imgUrl,
    status,
    rating,
  };
}
