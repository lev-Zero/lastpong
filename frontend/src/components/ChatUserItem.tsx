import { Circle, Flex, Text, Spacer, Image, Box } from '@chakra-ui/react';
import CustomAvatar from './CustomAvatar';
import { ChatUserItemProps, ChatUserStatus } from '@/interfaces/ChatUserItemProps';
import { ContextMenu } from 'chakra-ui-contextmenu';
import { OptionMenuChat, OptionMenuChatProps } from './OptionMenu';

export function ChatUserItem2({ user, role }: ChatUserItemProps) {
  return (
    <>
      {role === ChatUserStatus.OWNER ? (
        <Image src="/crown.svg" position="absolute" left={'4%'} zIndex={'100'} color="yellow" />
      ) : role === ChatUserStatus.ADMINISTRATOR ? (
        <Image
          src="/green_crown.svg"
          position="absolute"
          left={'4%'}
          zIndex={'100'}
          color="yellow"
        />
      ) : null}
      <Flex
        w="100%"
        justifyContent="space-around"
        alignItems="center"
        p={4}
        bg="gray.100"
        border="2px"
        borderRadius={20}
      >
        <CustomAvatar url={user.imgUrl} size="md" status={user.status} />
        <Spacer />
        <Text mr={2}>{user.name.toUpperCase()}</Text>
      </Flex>
    </>
  );
}

export default function ChatUserItem({ chatUserItem, chatRoom }: OptionMenuChatProps) {
  return (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => {
        return (
          <OptionMenuChat chatUserItem={chatUserItem} chatRoom={chatRoom} />
          // isAdmin={} isMuted={} isBanned={}
        );
      }}
    >
      {(ref) => (
        <Box ref={ref} w="100%" position="relative">
          <ChatUserItem2 user={chatUserItem.user} role={chatUserItem.role} />
        </Box>
      )}
    </ContextMenu>
  );
}
