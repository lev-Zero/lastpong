import { UserProps } from '@/interfaces/UserProps';
import { UserStatus } from '@/interfaces/UserProps';
import { avatarFetch } from '@/utils/avatarFetch';
import { convertRawUserToUser, RawUserProps } from '@/utils/convertRawUserToUser';
import { customFetch } from '@/utils/customFetch';
import create from 'zustand';

interface userStoreProps {
  me: UserProps;
  setMe: (user: UserProps) => void;
  fetchMe: () => Promise<void>;

  useOtp: boolean;
  fetchUseOtp: () => Promise<void>;
  setUseOtp: (useOtp: boolean) => void;
  toggleUseOtp: () => Promise<void>;

  friends: UserProps[];
  setFriends: (friends: UserProps[]) => void;
  fetchFriends: () => Promise<void>;
  fetchFriendsStatus: () => Promise<void>;
  addFriend: (name: string) => Promise<void>;
  deleteFriend: (name: string) => Promise<void>;
  blockedUsers: UserProps[];
  setBlockedUsers: (friends: UserProps[]) => void;
  fetchBlockedUsers: () => Promise<void>;
  addBlock: (name: string) => Promise<void>;
  deleteBlock: (name: string) => Promise<void>;
}

export const userStore = create<userStoreProps>((set, get) => ({
  me: {
    id: 0,
    name: ' ', // 처음 회원가입할 때 default name이 '' 이라서 구분을 위해 공백
    imgUrl: '',
    status: UserStatus.OFFLINE,
    rating: 0,
  },
  setMe: (user: UserProps) => {
    set((state) => ({ ...state, me: user }));
  },
  fetchMe: async () => {
    try {
      const rawMe: RawUserProps = await customFetch('GET', '/user/me');
      const me: UserProps = await convertRawUserToUser(rawMe);
      get().setMe(me);
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
      const rawFriends = await customFetch('GET', '/user/friend');
      const friends: UserProps[] = await Promise.all(
        rawFriends.map(async ({ friend: rawFriend }: any) => convertRawUserToUser(rawFriend))
      );
      get().setFriends(friends);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
        return;
      }
    }
  },
  fetchFriendsStatus: async () => {
    const rawFriends = await customFetch('GET', '/user/friend');
    if (rawFriends.length !== get().friends.length) {
      return;
    }
    const friendsCpy = get().friends.slice();
    friendsCpy.forEach((friend, idx) => {
      friend.status = rawFriends[idx].friend.status;
    });
    get().setFriends(friendsCpy);
  },
  addFriend: async (name: string) => {
    try {
      const json = await customFetch('POST', 'user/friend/name', { username: name });
      get().fetchFriends();
    } catch (e) {
      if (e instanceof Error) {
        throw Error(e.message);
      }
    }
  },
  deleteFriend: async (name: string) => {
    try {
      const text = await customFetch('DELETE', 'user/friend/name', { username: name });
      console.log(text);
      get().fetchFriends();
    } catch (e) {
      if (e instanceof Error) {
        throw Error(e.message);
      }
    }
  },
  blockedUsers: [],
  setBlockedUsers: (blockedUsers: UserProps[]) => {
    set((state) => ({ ...state, blockedUsers }));
  },
  fetchBlockedUsers: async () => {
    try {
      const rawBlockedUsers = await customFetch('GET', '/user/block');
      const blockedUsers: UserProps[] = await Promise.all(
        rawBlockedUsers.map(async ({ blockedUser: rawBlockedUser }: any) =>
          convertRawUserToUser(rawBlockedUser)
        )
      );
      get().setBlockedUsers(blockedUsers);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
        return;
      }
    }
  },
  addBlock: async (name: string) => {
    try {
      const json = await customFetch('POST', 'user/block/name', { username: name });
      console.log(json);
      get().fetchBlockedUsers();
    } catch (e) {
      if (e instanceof Error) {
        throw Error(e.message);
      }
    }
  },
  deleteBlock: async (name: string) => {
    try {
      const json = await customFetch('DELETE', 'user/block/name', { username: name });
      console.log(json);
      get().fetchBlockedUsers();
    } catch (e) {
      if (e instanceof Error) {
        throw Error(e.message);
      }
    }
  },
}));
