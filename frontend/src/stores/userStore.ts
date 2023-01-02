import { UserProps } from '@/interfaces/UserProps';
import { UserStatus } from '@/interfaces/UserProps';
import { avatarFetch } from '@/utils/avatarFetch';
import { customFetch } from '@/utils/customFetch';
import create from 'zustand';

interface userStoreProps {
  me: UserProps;
  setMe: (user: UserProps) => void;
  fetchMe: () => void;

  useOtp: boolean;
  fetchUseOtp: () => void;
  setUseOtp: (useOtp: boolean) => void;
  toggleUseOtp: () => void;

  friends: UserProps[];
  setFriends: (friends: UserProps[]) => void;
  fetchFriends: () => void;
  addFriend: (name: string) => void;
  deleteFriend: (name: string) => void;
}

export const userStore = create<userStoreProps>((set, get) => ({
  me: {
    id: 1,
    name: ' ', // FIXME: name=''은 첫 로그인인지(이름 정하는 페이지로 라우팅해야 하는지) 구분하는데 사용되므로 초기화는 다른 이름으로 해야함...
    imgUrl: '',
    status: UserStatus.OFFLINE,
    rating: 0,
  },
  setMe: (user: UserProps) => {
    set((state) => ({ ...state, me: user }));
  },
  fetchMe: async () => {
    try {
      const json = await customFetch('GET', '/user/me');
      const imgUrl = await avatarFetch('GET', '/user/avatar/me');
      const user = {
        id: json.id,
        name: json.username,
        imgUrl: imgUrl,
        status: json.status,
        rating: json.rating,
      };
      get().setMe(user);
      console.log('fetchMe', user);
    } catch (e) {
      if (e instanceof Error) {
        throw Error(e.message);
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
        throw Error(e.message);
      }
    }
  },
  setUseOtp: (useOtp: boolean) => {
    set((state) => ({ ...state, useOtp }));
  },
  toggleUseOtp: async () => {
    let path: string = '';
    if (get().useOtp) {
      path = '/auth/otp/off';
    } else {
      path = '/auth/otp/on';
    }
    try {
      await customFetch('PATCH', path);
      get().fetchUseOtp();
    } catch (e) {
      if (e instanceof Error) {
        throw Error(e.message);
      }
    }
  },
  friends: [],
  setFriends: (friends: UserProps[]) => {
    set((state) => ({ ...state, friends }));
  },
  fetchFriends: async () => {
    try {
      const arr = await customFetch('GET', '/user/friend');
      const friends: UserProps[] = await Promise.all(
        arr.map(async (json: any) => {
          const friend = json.friend;
          const imgUrl = await avatarFetch('GET', `/user/avatar/name/${friend.username}`);
          return {
            name: friend.username,
            imgUrl: imgUrl,
            status: friend.status,
            rating: friend.rating,
          };
        })
      );
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
        throw Error(e.message);
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
        throw Error(e.message);
      }
    }
  },
}));
