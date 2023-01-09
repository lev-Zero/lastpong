import { Circle, Flex, Text, Spacer, Image, Box } from '@chakra-ui/react';
import CustomAvatar from './CustomAvatar';
import { ChatUserItemProps, ChatUserStatus } from '@/interfaces/ChatUserItemProps';
import { ContextMenu } from 'chakra-ui-contextmenu';
import { ChatAdminOptionMenu } from './ChatAdminOptionMenu';
import { OptionMenu } from './OptionMenu';
import { userStore } from '@/stores/userStore';
import { useEffect, useState } from 'react';

function ChatUserItem({ user, role }: ChatUserItemProps) {
  return (
    <>
      {role === ChatUserStatus.OWNER ? (
        <Image src="/crown.svg" position="absolute" />
      ) : (
        <>{role === ChatUserStatus.ADMIN ? <Image src="/admin.svg" position="absolute" /> : null}</>
      )}
      <Flex
        w="100%"
        justifyContent="space-around"
        alignItems="center"
        p={4}
        bg="gray.100"
        border="2px"
        borderRadius={20}
      >
        <CustomAvatar url={user.imgUrl} size="md" />
        <Spacer />
        <Text mr={2}>{user.name.toUpperCase()}</Text>
      </Flex>
    </>
  );
}

export default function ContextMenuHoc({
  myChatUserStatus,
  user,
  isMuted,
  role,
  roomNo,
}: ChatUserItemProps) {
  const { friends } = userStore();
  const [isFriend, setIsFriend] = useState<boolean>();
  const [isBlocked, setIsBlocked] = useState<boolean>();

  useEffect(() => {
    setIsFriend(friends.some((friend) => friend.id === user.id));
    setIsBlocked(false); // TODO: isBlocked는 userStore에서 관리하다가 꺼내쎠야 함.
  }, []);

  return (
    <>
      {isFriend === undefined || isBlocked === undefined ? null : (
        <ContextMenu<HTMLDivElement>
          renderMenu={() => (
            <>
              {myChatUserStatus !== ChatUserStatus.COMMON ? (
                <ChatAdminOptionMenu
                  user={user}
                  isFriend={isFriend}
                  isBlocked={isBlocked}
                  role={role}
                  isMuted={isMuted}
                  roomNo={roomNo}
                />
              ) : (
                <OptionMenu user={user} isFriend={isFriend} isBlocked={isBlocked}></OptionMenu>
              )}
            </>
          )}
        >
          {(ref) => (
            <Box ref={ref} w="100%" position="relative" px={3} py={1}>
              <ChatUserItem
                myChatUserStatus={myChatUserStatus}
                user={user}
                isMuted={isMuted}
                role={role}
                roomNo={roomNo}
              />
            </Box>
          )}
        </ContextMenu>
      )}
    </>
  );
}
