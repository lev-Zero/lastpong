import { ChatUserStatus } from '@/interfaces/ChatUserItemProps';
import { UserStatus } from '@/interfaces/UserProps';
import { chatStore } from '@/stores/chatStore';
import { userStore } from '@/stores/userStore';
import { MenuDivider, MenuItem, MenuList, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { OptionMenuProps } from './OptionMenu';

export interface ChatAdminOptionMenuProps extends OptionMenuProps {
  role: ChatUserStatus;
  isMuted: boolean;
  roomNo: number | undefined;
}

export function ChatAdminOptionMenu({
  user,
  isFriend,
  isBlocked,
  role,
  isMuted,
  roomNo,
}: ChatAdminOptionMenuProps) {
  const { addFriend, deleteFriend } = userStore();
  const { giveAdmin, removeAdmin, addBan } = chatStore();

  return (
    <MenuList>
      <MenuItem>
        {role === ChatUserStatus.COMMON ? (
          <Text onClick={() => giveAdmin(roomNo, user.id)}>GIVE ADMIN</Text>
        ) : (
          <Text color="red" onClick={() => removeAdmin(roomNo, user.id)}>
            REMOVE ADMIN
          </Text>
        )}
      </MenuItem>
      <MenuItem>
        {!isMuted ? (
          <Text onClick={() => {}}>MUTE 1 MIN</Text>
        ) : (
          <Text color="gray.200">MUTE 1 MIN</Text>
        )}
      </MenuItem>
      <MenuItem>
        <Text color="red" onClick={() => addBan(roomNo, user.id)}>
          BAN USER
        </Text>
      </MenuItem>
      <MenuDivider />
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
