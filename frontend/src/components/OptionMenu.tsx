import { UserProps, UserStatus } from '@/interfaces/UserProps';
import { userStore } from '@/stores/userStore';
import { MenuItem, MenuList, Text } from '@chakra-ui/react';
import Link from 'next/link';

export interface OptionMenuProps {
  user: UserProps;
  isFriend: boolean;
  isBlocked: boolean;
}

export function OptionMenu({ user, isFriend, isBlocked }: OptionMenuProps) {
  const { addFriend, deleteFriend } = userStore();

  return (
    <MenuList>
      <MenuItem as={Link} href={`/user/${user.name}`}>
        VIEW PROFILE
      </MenuItem>
      <MenuItem>
        {user.status === UserStatus.ONLINE ? (
          <Text>INVITE TO GAME</Text>
        ) : (
          <Text color="gray.200">INVITE TO GAME</Text>
        )}
      </MenuItem>
      <MenuItem>
        {!isFriend ? (
          <Text color="win" onClick={() => addFriend(user.name)}>
            ADD FRIEND
          </Text>
        ) : (
          <Text color="red" onClick={() => deleteFriend(user.name)}>
            DELETE FRIEND
          </Text>
        )}
      </MenuItem>
      <MenuItem>
        {!isBlocked ? (
          <Text color="red" onClick={() => {}}>
            BLOCK
          </Text>
        ) : (
          <Text color="black" onClick={() => {}}>
            UNBLOCK
          </Text>
        )}
      </MenuItem>
    </MenuList>
  );
}
