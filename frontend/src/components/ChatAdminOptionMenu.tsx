import { ChatUserStatus } from '@/interfaces/ChatUserItemProps';
import { UserStatus } from '@/interfaces/UserProps';
import { chatStore } from '@/stores/chatStore';
import { userStore } from '@/stores/userStore';
import { MenuDivider, MenuItem, MenuList, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { ChatOptionMenuProps } from './ChatOptionMenu';

export interface ChatAdminOptionMenuProps extends ChatOptionMenuProps {
  role: ChatUserStatus;
  isMuted: boolean;
  roomNo: number | undefined;
  myRole: ChatUserStatus;
}

export function ChatAdminOptionMenu({
  user,
  isFriend,
  isBlocked,
  role,
  isMuted,
  roomNo,
  myRole,
}: ChatAdminOptionMenuProps) {
  const { me, addFriend, deleteFriend, addBlock, deleteBlock } = userStore();
  const { giveAdmin, removeAdmin, addBan, muteUser, removeMute } = chatStore();

  if (me.name === user.name) return null;
  return (
    <MenuList>
      {myRole !== ChatUserStatus.OWNER && role !== ChatUserStatus.COMMON ? null : (
        <>
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
              <Text
                onClick={() => {
                  muteUser(roomNo, user.id);
                }}
              >
                MUTE 1 MIN
              </Text>
            ) : (
              <Text
                color="black"
                onClick={() => {
                  removeMute(roomNo, user.id);
                }}
              >
                UNMUTE
              </Text>
            )}
          </MenuItem>

          <MenuItem>
            <Text color="red" onClick={() => addBan(roomNo, user.id)}>
              BAN USER
            </Text>
          </MenuItem>

          <MenuDivider />
        </>
      )}
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
      {user.name !== me.name ? (
        <>
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
              <Text color="red" onClick={() => addBlock(user.name)}>
                BLOCK
              </Text>
            ) : (
              <Text color="black" onClick={() => deleteBlock(user.name)}>
                UNBLOCK
              </Text>
            )}
          </MenuItem>
        </>
      ) : null}
    </MenuList>
  );
}
