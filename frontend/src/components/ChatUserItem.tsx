import { Circle, Flex, Text, Spacer, Image, Box } from '@chakra-ui/react';
import CustomAvatar from './CustomAvatar';
import { ChatUserItemProps, ChatUserStatus } from '@/interfaces/ChatUserItemProps';
import { ContextMenu } from 'chakra-ui-contextmenu';
import { ChatAdminOptionMenu } from './ChatAdminOptionMenu';
import { OptionMenu } from './OptionMenu';
import { userStore } from '@/stores/userStore';
import { useEffect, useState } from 'react';

function ChatUserItem({ myChatUserStatus, user, role, roomNo }: ChatUserItemProps) {
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
  role,
  roomNo,
}: ChatUserItemProps) {
  const { friends } = userStore();
  const [isFriend, setIsFriend] = useState<boolean>();
  const [isBlocked, setIsBlocked] = useState<boolean>(false); // TODO: 추후 로직 추가
  const [isMuted, setIsMuted] = useState<boolean>(false); // TODO: 추후 로직 추가

  useEffect(() => {
    setIsFriend(friends.some((friend) => friend.id === user.id));
  }, []);

  return (
    <>
      {isFriend === undefined ||
      isBlocked === undefined ||
      (myChatUserStatus !== ChatUserStatus.COMMON && isMuted === undefined) ? (
        <></>
      ) : (
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
