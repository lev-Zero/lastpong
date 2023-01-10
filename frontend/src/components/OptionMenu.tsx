import { UserProps, UserStatus } from '@/interfaces/UserProps';
import { userStore } from '@/stores/userStore';
import { MenuItem, MenuList, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { chatStore } from '@/stores/chatStore';

export interface OptionMenuProps {
  user: UserProps;
  isFriend: boolean;
  isBlocked: boolean;
}

export function OptionMenu({ user, isFriend, isBlocked }: OptionMenuProps) {
  const { addFriend, deleteFriend } = userStore();
  const { socket } = chatStore();

  return (
    <MenuList>
      <MenuItem as={Link} href={`/user/${user.name}`}>
        VIEW PROFILE
      </MenuItem>
      <MenuItem>
        {user.status === UserStatus.ONLINE || user.status === UserStatus.INGAME ? (
          <Text
            onClick={() => {
              if (socket !== undefined) {
                socket.emit('createInviteRoom', {
                  userId: user.id,
                });
              }
            }}
          >
            INVITE TO GAME
          </Text>
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
    </MenuList>
  );
}
