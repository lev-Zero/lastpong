import { Circle, Flex, Text, Spacer, Image } from '@chakra-ui/react';
import CustomAvatar from './CustomAvatar';
import { ChatUserItemProps, ChatUserStatus } from '@/interfaces/ChatUserItemProps';

export default function ChatUserItem({ user, role }: ChatUserItemProps) {
  return (
    <>
      {role !== ChatUserStatus.COMMON ? (
        <Image src="/crown.svg" position="absolute" color="yellow" />
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
