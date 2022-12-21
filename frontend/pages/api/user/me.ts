import { UserProps, UserStatus } from '@/interfaces/UserProps';
import type { NextApiRequest, NextApiResponse } from 'next';

const user: UserProps = {
  name: 'yopark',
  imageUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6d/Olaf_from_Disney%27s_Frozen.png',
  status: UserStatus.online,
  rating: 1072,
  winCnt: 3,
  loseCnt: 2,
  useOtp: false,
};

export default function handler(req: NextApiRequest, res: NextApiResponse<UserProps>) {
  res.status(200).json(user);
}
