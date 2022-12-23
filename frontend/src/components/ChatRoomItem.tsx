import { UserProps } from '@/interfaces/UserProps';
import { Box, Flex, HStack, Image, Spacer, Text, VStack } from '@chakra-ui/react';
import CustomAvatar from './CustomAvatar';

export interface ChatRoomItemProps {
  title: string;
  owner: UserProps;
  isPrivate: boolean;
  password?: string;
}

export function ChatRoomItem({ title, owner, isPrivate, password = '' }: ChatRoomItemProps) {
  return (
    <Box bg="white" borderRadius={20} border="2px" p={5}>
      <Flex flexDirection="column">
        <HStack>
          <CustomAvatar url={owner.imgUrl} size="sm" />
          <Text fontSize="md">{owner.name.toUpperCase()}</Text>
        </HStack>
        <Flex>
          <Text fontSize="2xl">{title}</Text>
          <Spacer />
          {!isPrivate ? null : <Image src="/lock.svg" />}
        </Flex>
      </Flex>
    </Box>
  );
}
