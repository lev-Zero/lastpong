import { ChatRoomProps } from '@/interfaces/ChatRoomProps';
import { ChatUserItemProps, ChatUserStatus } from '@/interfaces/ChatUserItemProps';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import { chatStore } from '@/stores/chatStore';
import { userStore } from '@/stores/userStore';
import { Menu, MenuItem, MenuList, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export interface OptionMenuProps {
  user: UserProps;
  isFriend: boolean;
  isBlocked: boolean;
}

export interface OptionMenuChatProps {
  chatUserItem: ChatUserItemProps;
  chatRoom: ChatRoomProps;
}

export function OptionMenu({ user, isFriend, isBlocked }: OptionMenuProps) {
  const { deleteFriend } = userStore();

  return (
    <MenuList>
      <MenuItem as={Link} href={`/user/${user.name}`}>
        VIEW PROFILE
      </MenuItem>
      {user.status === UserStatus.ONLINE ? (
        <MenuItem>INVITE TO GAME</MenuItem>
      ) : (
        <MenuItem>
          <Text color="gray.200">INVITE TO GAME</Text>
        </MenuItem>
      )}
      {!isFriend ? (
        <MenuItem>
          <Text
            color="win"
            onClick={() => {
              console.log('add friend');
            }}
          ></Text>
          ADD FRIEND
        </MenuItem>
      ) : (
        <MenuItem>
          <Text color="red" onClick={() => deleteFriend(user.name)}>
            DELETE FRIEND
          </Text>
        </MenuItem>
      )}
      {!isBlocked ? (
        <MenuItem>
          <Text color="red">BLOCK</Text>
        </MenuItem>
      ) : (
        <MenuItem>
          <Text color="black">UNBLOCK</Text>
        </MenuItem>
      )}
    </MenuList>
  );
}

export function OptionMenuChat({ chatUserItem, chatRoom }: OptionMenuChatProps) {
  const { friends, addFriend, deleteFriend } = userStore();
  const { socket } = chatStore();
  const router = useRouter();

  const [user, setUser] = useState<UserProps>(chatUserItem.user);
  const [role, setRole] = useState<ChatUserStatus>(chatUserItem.role);
  const [isFriend, setIsFriend] = useState<boolean>(friends.includes(chatUserItem.user));
  const [isMuted, setIsMuted] = useState<boolean>(chatRoom.mutedUsers.includes(chatUserItem.user));
  const [isBanned, setIsBanned] = useState<boolean>(
    chatRoom.bannedUsers.includes(chatUserItem.user)
  );
  //FIXME: 이중 어떤 기능도 작동은 하는 듯 보이나 메뉴 목록에 실시간 반영이 안됨
  return (
    <MenuList>
      {/* 프로필보기 */}
      <MenuItem as={Link} href={`/user/${user.name}`}>
        VIEW PROFILE
      </MenuItem>
      {/* 게임 초대 */}
      {user.status === UserStatus.ONLINE ? (
        <MenuItem>INVITE TO GAME</MenuItem>
      ) : (
        <MenuItem>
          <Text color="gray.200">INVITE TO GAME</Text>
        </MenuItem>
      )}
      {/* 친구 추가 */}
      {!isFriend ? (
        <MenuItem
          onClick={() => {
            console.log('add friend');
            addFriend(user.name);
          }}
        >
          <Text color="win"></Text>
          ADD FRIEND
        </MenuItem>
      ) : (
        <MenuItem onClick={() => deleteFriend(user.name)}>
          <Text color="red">DELETE FRIEND</Text>
        </MenuItem>
      )}
      {/* 관리자 권한 부여 */}
      {!(role === ChatUserStatus.ADMINISTRATOR) ? (
        <MenuItem
          onClick={() => {
            console.log('add Admin');
            console.log(socket);
            socket?.emit(
              'addAdmin',
              {
                chatRoomId: parseInt(router.query.roomNo as string),
                userId: user.id,
              },
              (res: any) => console.log(res)
            );
          }}
        >
          <Text color="win"></Text>
          GIVE ADMIN
        </MenuItem>
      ) : (
        <MenuItem
          onClick={() => {
            console.log('del Admin');
            socket?.emit(
              'removeAdmin',
              {
                chatRoomId: parseInt(router.query.roomNo as string),
                userId: user.id,
              },
              (res: any) => console.log(res)
            );
          }}
        >
          <Text color="red">DEL ADMIN</Text>
        </MenuItem>
      )}
      {/* 뮤트하기 */}
      {!isMuted ? (
        <MenuItem
          onClick={() => {
            console.log('Mute User');
            console.log(socket);
            socket?.emit(
              'addMute',
              {
                chatRoomId: parseInt(router.query.roomNo as string),
                userId: user.id,
              },
              (res: any) => console.log(res)
            );
          }}
        >
          <Text color="win"></Text>
          GIVE ADMIN
        </MenuItem>
      ) : (
        <MenuItem
          onClick={() => {
            console.log('unMute User');
            socket?.emit(
              'removeMute',
              {
                chatRoomId: parseInt(router.query.roomNo as string),
                userId: user.id,
              },
              (res: any) => console.log(res)
            );
          }}
        >
          <Text color="red">DEL ADMIN</Text>
        </MenuItem>
      )}
      {/* 벤하기 */}
      {!isBanned ? (
        <MenuItem
          onClick={() => {
            console.log('Ban User');
            console.log(socket);
            socket?.emit(
              'addBan',
              {
                chatRoomId: parseInt(router.query.roomNo as string),
                userId: user.id,
              },
              (res: any) => console.log(res)
            );
          }}
        >
          <Text color="win"></Text>
          BAN USER
        </MenuItem>
      ) : (
        <MenuItem
          onClick={() => {
            console.log('UnBan User');
            socket?.emit(
              'removeBan',
              {
                chatRoomId: parseInt(router.query.roomNo as string),
                userId: user.id,
              },
              (res: any) => console.log(res)
            );
          }}
        >
          <Text color="red">UNBAN</Text>
        </MenuItem>
      )}
    </MenuList>
  );
}
