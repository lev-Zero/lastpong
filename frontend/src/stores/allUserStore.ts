import { UserProps } from '@/interfaces/UserProps';
import { convertRawUserToUser, RawUserProps } from '@/utils/convertRawUserToUser';
import { customFetch } from '@/utils/customFetch';
import create from 'zustand';

interface allUserStoreProps {
  allUsers: UserProps[];
  setAllUsers: (users: UserProps[]) => void;
  getAllUsers: () => Promise<UserProps[]>;
}

export const allUserStore = create<allUserStoreProps>((set, get) => ({
  allUsers: [],
  setAllUsers: (allUsers: UserProps[]) => {
    set((state) => ({ ...state, allUsers }));
  },
  getAllUsers: async (): Promise<UserProps[]> => {
    try {
      const rawUsers = await customFetch('GET', '/user');
      const userList: UserProps[] = await Promise.all(
        rawUsers.map(async (rawUser: RawUserProps) => await convertRawUserToUser(rawUser))
      );
      get().setAllUsers(userList);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
    return get().allUsers;
  },
}));
