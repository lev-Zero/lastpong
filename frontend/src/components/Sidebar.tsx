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

  const friend2: UserProps = {
    name: 'cmoon',
    imgUrl:
      'https://images.ctfassets.net/usf1vwtuqyxm/3SQ3X2km8wkQIsQWa02yOY/8801d7055a3e99dae8e60f54bb4b1db8/HarryPotter_WB_F4_HarryPotterMidshot_Promo_080615_Port.jpg?w=914&q=70&fm=jpg',
    status: UserStatus.online,
    rating: 1028,
    winCnt: 3,
    loseCnt: 2,
    useOtp: false,
  };

  return (
    <VStack w="100%" h="100%" padding={5} backgroundColor="white">
      <Flex w="100%">
        <Text>FRIENDS</Text>
        <Spacer />
        <Box bg="red" w={30} h={30}></Box>
      </Flex>
      <VStack w="100%" overflowY="scroll">
        <UserItem user={friend} msgNum={3} />
        <UserItem user={friend2} msgNum={0} />
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
