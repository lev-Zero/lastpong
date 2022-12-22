import { UserProps, UserStatus } from '@/interfaces/UserProps';
import { VStack, Text, Flex, Spacer, Box } from '@chakra-ui/react';
import UserItem from './UserItem';

export default function Sidebar() {
  const friend: UserProps = {
    name: 'yopark',
    imgUrl: '',
    status: UserStatus.inGame,
    rating: 1028,
    winCnt: 3,
    loseCnt: 2,
    useOtp: false,
  };

  return (
    <VStack w="100%" h="90vh" padding={5} backgroundColor="white">
      <Flex w="100%">
        <Text>FRIENDS</Text>
        <Spacer />
        <Box bg="red" w={30} h={30}></Box>
      </Flex>
      <VStack w="100%" overflowY="scroll">
        <UserItem user={friend} msgNum={3} />
        <UserItem user={friend} msgNum={3} />
        <UserItem user={friend} msgNum={3} />
        <UserItem user={friend} msgNum={3} />
        <UserItem user={friend} msgNum={3} />
        <UserItem user={friend} msgNum={3} />
        <UserItem user={friend} msgNum={3} />
        <UserItem user={friend} msgNum={3} />
      </VStack>
    </VStack>
  );
}
