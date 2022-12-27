import { UserStatus } from '@/interfaces/UserProps';
import { UserProps } from '@/interfaces/UserProps';
import { customFetch } from '@/utils/customFetch';
import create from 'zustand';

interface userStoreProps {
  me: UserProps;
  setUseOtp: (useOtp: boolean) => void;
  setUser: (user: UserProps) => void;
  fetchMe: () => void;
}

export const userStore = create<userStoreProps>((set, get) => ({
  me: {
    name: '',
    imgUrl: '',
    status: UserStatus.offline,
    rating: 0,
    useOtp: false,
  },
  setUseOtp: (useOtp: boolean) => {
    set((state) => ({ ...state, me: { ...get().me, useOtp } }));
  },
  setUser: (user: UserProps) => {
    set((state) => ({ ...state, me: user }));
  },
  fetchMe: async () => {
    try {
      const json = await customFetch('GET', '/user/me');
      const user = {
        name: json.username,
        imgUrl: '', // TODO : img는 따로 가져와야 한다.
        status: json.status,
        rating: json.rating,
        useOtp: false,
      };
      console.log('fetchMe', user);
      get().setUser(user);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
        return;
      }
    }
  },
}));
