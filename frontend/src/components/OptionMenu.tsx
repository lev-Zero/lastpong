import { UserProps, UserStatus } from '@/interfaces/UserProps';
import { userStore } from '@/stores/userStore';
import { MenuItem, MenuList, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { chatStore } from '@/stores/chatStore';

export interface OptionMenuProps {
  user: UserProps;
  isFriend: boolean;
}

export function OptionMenu({ user, isFriend }: OptionMenuProps) {
  const { me, addFriend, deleteFriend } = userStore();
  const { socket, setIsInvited } = chatStore();

  return (
    <MenuList>
      <MenuItem as={Link} href={`/user/${user.name}`}>
        VIEW PROFILE
      </MenuItem>
      <MenuItem>
        {user.status === UserStatus.OFFLINE ||
        user.status === UserStatus.ONLINE ||
        user.status === UserStatus.INGAME ? (
          <Text
            onClick={() => {
              console.log('CHECK Invite');
              if (socket === undefined) {
                console.log('createInviteRoom : socket undefind');
                return;
              }
              if (socket.connected === false) {
                console.log('createInviteRoom : socket connected FALSE');
                return;
              }
              console.log('EMIT CHAT : createInviteRoom');
              socket.emit('createInviteRoom', {
                userId: user.id,
              });
              setIsInvited(2);
            }}
          >
            INVITE TO GAME
          </Text>
        ) : (
          <Text color="gray.200">INVITE TO GAME</Text>
        )}
      </MenuItem>
      {user.name !== me.name ? (
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
      ) : null}
    </MenuList>
  );
}
