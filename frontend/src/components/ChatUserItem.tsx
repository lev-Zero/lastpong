import { Circle, Flex, Text, Spacer, Image, Box } from '@chakra-ui/react';
import CustomAvatar from './CustomAvatar';
import { ChatUserItemProps, ChatUserStatus } from '@/interfaces/ChatUserItemProps';
import { ContextMenu } from 'chakra-ui-contextmenu';
import { ChatAdminOptionMenu } from './ChatAdminOptionMenu';
import { OptionMenu } from './OptionMenu';

function ChatUserItem({ myChatUserStatus, user, role, roomNo }: ChatUserItemProps) {
  return (
    <>
      {role === ChatUserStatus.OWNER ? (
        <Image src="/crown.svg" position="absolute" />
      ) : (
        <>
          {role === ChatUserStatus.ADMINISTRATOR ? (
            <Image src="/admin.svg" position="absolute" />
          ) : null}
        </>
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
  return (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => (
        <>
          {myChatUserStatus !== ChatUserStatus.COMMON ? (
            <ChatAdminOptionMenu
              user={user}
              isFriend={true}
              isBlocked={false}
              role={role}
              isMuted={false}
              roomNo={roomNo}
            />
          ) : (
            <OptionMenu user={user} isFriend={true} isBlocked={false}></OptionMenu>
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
  );
}
