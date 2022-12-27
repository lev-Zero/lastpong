import { UserProps, UserStatus } from '@/interfaces/UserProps';
import { userStore } from '@/stores/userStore';
import { VStack, Text, Flex, Spacer, Box } from '@chakra-ui/react';
import { useEffect } from 'react';
import UserItem from './UserItem';

export default function Sidebar() {
  const { friends, fetchFriends } = userStore();

  useEffect(() => fetchFriends, []);

  return (
    <VStack w="100%" h="100%" padding={5} backgroundColor="white">
      <Flex w="100%">
        <Text>FRIENDS</Text>
        <Spacer />
        <Box bg="red" w={30} h={30}></Box>
      </Flex>
      <VStack w="100%" overflowY="scroll">
        {friends.map((friend, index) => (
          <UserItem key={index} user={friend} msgNum={0} />
        ))}
      </VStack>
    </VStack>
  );
}
