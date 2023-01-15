import { ChatUserStatus } from '@/interfaces/ChatUserItemProps';
import { UserStatus } from '@/interfaces/UserProps';
import { chatStore } from '@/stores/chatStore';
import { userStore } from '@/stores/userStore';
import { MenuDivider, MenuItem, MenuList, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { ChatOptionMenuProps } from './ChatOptionMenu';
import React, { useEffect, useState } from 'react';

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
  const { socket: chatSocket, setIsInvited } = chatStore();
  const [timerId, setTimerId] = useState<NodeJS.Timeout>();

  function inviteToGame() {
    if (chatSocket === undefined || !chatSocket.connected) {
      console.log('socket is not ready');
      return;
    }
    console.log('INVITE TO GAME 버튼이 정상적으로 눌렸습니다.');
    chatSocket.emit('createInviteRoom', { userId: user.id });
    setIsInvited(2);
  }

  function muteUserAndRemove() {
    muteUser(roomNo, user.id);
    const id = setTimeout(() => {
      removeMute(roomNo, user.id);
      // console.log('refreshed');
    }, 62 * 1000);
    setTimerId(id);
  }

  //작동안하는듯 보이는 클리어함수
  // useEffect(() => {
  //   return () => {
  //     console.log(timerId);
  //     clearTimeout(timerId);
  //     console.log('add mute timer Cleared');
  //   };
  // }, []);

  if (me.name === user.name) return null;
  return (
    <MenuList>
      {myRole !== ChatUserStatus.OWNER && role !== ChatUserStatus.COMMON ? null : (
        <>
          {myRole === ChatUserStatus.OWNER ? (
            <MenuItem>
              {role === ChatUserStatus.COMMON ? (
                <Text onClick={() => giveAdmin(roomNo, user.id)}>GIVE ADMIN</Text>
              ) : (
                <Text color="red" onClick={() => removeAdmin(roomNo, user.id)}>
                  REMOVE ADMIN
                </Text>
              )}
            </MenuItem>
          ) : null}

          {role === ChatUserStatus.ADMIN || role === ChatUserStatus.OWNER ? null : (
            <MenuItem>
              {!isMuted ? (
                <Text
                  onClick={() => {
                    muteUserAndRemove();
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
          )}

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
          <Text onClick={inviteToGame}>INVITE TO GAME</Text>
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
