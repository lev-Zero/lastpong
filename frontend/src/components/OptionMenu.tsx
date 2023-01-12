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
  const { socket: chatSocket, setIsInvited } = chatStore();

  function inviteToGame() {
    if (chatSocket === undefined || !chatSocket.connected) {
      console.log('socket is not ready');
      return;
    }
    console.log('INVITE TO GAME 버튼이 정상적으로 눌렸습니다.');
    chatSocket.emit('createInviteRoom', { userId: user.id });
    setIsInvited(2);
  }

  return (
    <MenuList>
      <MenuItem as={Link} href={`/user/${user.name}`}>
        VIEW PROFILE
      </MenuItem>
      <MenuItem>
        {user.status === UserStatus.ONLINE ? (
          <Text onClick={inviteToGame}>INVITE TO GAME</Text>
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
