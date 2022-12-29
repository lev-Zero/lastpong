import { UserProps } from '@/interfaces/UserProps';
import { UserStatus } from '@/interfaces/UserProps';
import { customFetch } from '@/utils/customFetch';
import create from 'zustand';

interface userStoreProps {
  me: UserProps;
  setMe: (user: UserProps) => void;
  fetchMe: () => void;

  useOtp: boolean;
  fetchUseOtp: () => void;
  setUseOtp: (useOtp: boolean) => void;

  friends: UserProps[];
  setFriends: (friends: UserProps[]) => void;
  fetchFriends: () => void;
  addFriend: (name: string) => void;
  deleteFriend: (name: string) => void;
}

export const userStore = create<userStoreProps>((set, get) => ({
  me: {
    name: '',
    imgUrl: '',
    status: UserStatus.offline,
    rating: 0,
  },
  setMe: (user: UserProps) => {
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
      };
      get().setMe(user);
      console.log('fetchMe', user);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
        return;
      }
    }
  },
  useOtp: false,
  fetchUseOtp: async () => {
    try {
      const json = await customFetch('GET', '/auth/otp');
      const useOtp = json.otpOn;
      get().setUseOtp(useOtp);
      console.log('fetchUseOtp', useOtp);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
        return;
      }
    }
  },
  setUseOtp: (useOtp: boolean) => {
    set((state) => ({ ...state, useOtp }));
  },
  friends: [],
  setFriends: (friends: UserProps[]) => {
    set((state) => ({ ...state, friends }));
  },
  fetchFriends: async () => {
    try {
      const arr = await customFetch('GET', 'user/friend');
      const friends: UserProps[] = arr.map((json: any) => {
        const friend = json.friend;
        return {
          name: friend.username,
          imgUrl: '',
          status: friend.status,
          rating: friend.rating,
        };
      });
      get().setFriends(friends);
      console.log('fetchFriends', friends);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
        return;
      }
    }
  },
  addFriend: async (name: string) => {
    try {
      const json = await customFetch('POST', 'user/friend/name/' + name, { username: name });
      get().fetchFriends();
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
        return;
      }
    }
  },
  deleteFriend: async (name: string) => {
    try {
      const text = await customFetch('DELETE', 'user/friend/name/' + name, { username: name });
      console.log(text);
      get().fetchFriends();
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
        return;
      }
    }
  },
}));
