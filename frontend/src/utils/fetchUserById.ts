import { UserProps } from '@/interfaces/UserProps';
import { convertRawUserToUser, RawUserProps } from '@/utils/convertRawUserToUser';
import { customFetch } from '@/utils/customFetch';

export async function fetchUserById(id: number): Promise<UserProps> {
  const json: RawUserProps = await customFetch('GET', `/user/id/${id}`);
  const user: UserProps = await convertRawUserToUser(json);
  return user;
}
