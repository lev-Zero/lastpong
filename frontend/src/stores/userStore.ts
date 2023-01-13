import { UserProps } from '@/interfaces/UserProps';
import { UserStatus } from '@/interfaces/UserProps';
import { convertRawUserToUser, RawUserProps } from '@/utils/convertRawUserToUser';
import { customFetch } from '@/utils/customFetch';
import create from 'zustand';

interface userStoreProps {
  me: UserProps;
  setMe: (user: UserProps) => void;
  fetchMe: () => Promise<void> | never; // never -> can throws Error
  resetMe: () => void;

  useOtp: boolean;
  fetchUseOtp: () => Promise<void> | never;
  setUseOtp: (useOtp: boolean) => void | never;
  toggleUseOtp: () => Promise<void> | never;

  friends: UserProps[];
  setFriends: (friends: UserProps[]) => void;
  fetchFriends: () => Promise<void> | never;
  fetchFriendsStatus: () => Promise<void> | never;
  addFriend: (name: string) => Promise<void>;
  deleteFriend: (name: string) => Promise<void>;

  blockedUsers: UserProps[];
  setBlockedUsers: (friends: UserProps[]) => void | never;
  fetchBlockedUsers: () => Promise<void> | never;
  addBlock: (name: string) => Promise<void>;
  deleteBlock: (name: string) => Promise<void>;

  allUsers: UserProps[];
  setAllUsers: (allUsers: UserProps[]) => void;
  fetchAllUsers: () => Promise<void> | never;
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
    const rawMe: RawUserProps = await customFetch('GET', '/user/me');
    const me: UserProps = await convertRawUserToUser(rawMe);
    get().setMe(me);
  },
  resetMe: () => {
    get().setMe({
      id: 0,
      name: ' ', // 처음 회원가입할 때 default name이 '' 이라서 구분을 위해 공백
      imgUrl: '',
      status: UserStatus.OFFLINE,
      rating: 0,
    });
  },
  useOtp: false,
  fetchUseOtp: async () => {
    const json = await customFetch('GET', '/auth/otp');
    const useOtp = json.otpOn;
    get().setUseOtp(useOtp);
  },
  setUseOtp: (useOtp: boolean) => {
    set((state) => ({ ...state, useOtp }));
  },
  toggleUseOtp: async () => {
    customFetch('PATCH', `/auth/otp/${get().useOtp ? 'off' : 'on'}`)
      .then(() => get().fetchUseOtp())
      .catch(console.log);
  },
  friends: [],
  setFriends: (friends: UserProps[]) => {
    set((state) => ({ ...state, friends }));
  },
  fetchFriends: async () => {
    const rawFriends = await customFetch('GET', '/user/friend');
    const friends: UserProps[] = await Promise.all(
      rawFriends.map(async ({ friend: rawFriend }: any) => convertRawUserToUser(rawFriend))
    );
    get().setFriends(friends);
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
    customFetch('POST', 'user/friend/name', { username: name })
      .then(() => get().fetchFriends())
      .catch(console.log);
  },
  deleteFriend: async (name: string) => {
    customFetch('DELETE', 'user/friend/name', { username: name })
      .then(() => get().fetchFriends())
      .catch(console.log);
  },
  blockedUsers: [],
  setBlockedUsers: (blockedUsers: UserProps[]) => {
    set((state) => ({ ...state, blockedUsers }));
  },
  fetchBlockedUsers: async () => {
    const rawBlockedUsers = await customFetch('GET', '/user/block');
    const blockedUsers: UserProps[] = await Promise.all(
      rawBlockedUsers.map(async ({ blockedUser: rawBlockedUser }: any) =>
        convertRawUserToUser(rawBlockedUser)
      )
    );
    get().setBlockedUsers(blockedUsers);
  },
  addBlock: async (name: string) => {
    customFetch('POST', 'user/block/name', { username: name })
      .then(() => get().fetchBlockedUsers())
      .catch(console.log);
  },
  deleteBlock: async (name: string) => {
    customFetch('DELETE', 'user/block/name', { username: name })
      .then(() => get().fetchBlockedUsers())
      .catch(console.log);
  },
  allUsers: [],
  setAllUsers: (allUsers: UserProps[]) => {
    set((state) => ({ ...state, allUsers }));
  },
  fetchAllUsers: async () => {
    const rawAllUsers = await customFetch('GET', '/user');
    const allUsers: UserProps[] = await Promise.all(
      rawAllUsers.map(async (rawUser: RawUserProps) => await convertRawUserToUser(rawUser))
    );
    get().setAllUsers(allUsers);
  },
}));
