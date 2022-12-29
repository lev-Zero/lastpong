import { UserProps } from '@/interfaces/UserProps';
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
    console.log('allUsers333', get().allUsers);
  },
  getAllUsers: async (): Promise<UserProps[]> => {
    try {
      let users = await customFetch('GET', '/user');
      let userList: UserProps[] = users.map((json: any): UserProps => {
        // console.log(json);
        return {
          name: json.username,
          imgUrl: '',
          status: json.status,
          rating: json.rating,
        };
      });
      get().setAllUsers(userList);
      console.log('getAllUsers22', get().allUsers);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
    return get().allUsers;
  },
}));
