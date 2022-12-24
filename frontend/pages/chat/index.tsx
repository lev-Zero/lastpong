import { ChatRoomItem, ChatRoomItemProps } from '@/components/ChatRoomItem';
import { CustomButton } from '@/components/CustomButton';
import UserItem from '@/components/UserItem';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import MainLayout from '@/layouts/MainLayout';
import { Box, Flex, HStack, SimpleGrid, VStack } from '@chakra-ui/react';
import Head from 'next/head';
import { ReactElement } from 'react';

export default function ChatPage() {
  const friend: UserProps = {
    name: 'yopark',
    imgUrl: '',
    status: UserStatus.inGame,
    rating: 1028,
    winCnt: 3,
    loseCnt: 2,
    useOtp: false,
  };

  const owner: UserProps = {
    name: 'yopark',
    imgUrl: '',
    status: UserStatus.inGame,
    rating: 1028,
    winCnt: 3,
    loseCnt: 2,
    useOtp: false,
  };

  const dummyChatRoom: ChatRoomItemProps = {
    title: 'Lonely Night Chat',
    owner: owner,
    isPrivate: true,
    password: '1234',
  };

  return (
    <>
      <Head>
        <title>채팅 | LastPong</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex w="100%" h="100%">
        <VStack w="70%" h="90%" my={10}>
          <Box overflowY="scroll" mb={10}>
            <SimpleGrid columns={2} spacing={5}>
              <ChatRoomItem
                title={dummyChatRoom.title}
                owner={dummyChatRoom.owner}
                isPrivate={false}
                password={dummyChatRoom.password}
              />
              <ChatRoomItem
                title={dummyChatRoom.title}
                owner={dummyChatRoom.owner}
                isPrivate={dummyChatRoom.isPrivate}
                password={dummyChatRoom.password}
              />
              <ChatRoomItem
                title={dummyChatRoom.title}
                owner={dummyChatRoom.owner}
                isPrivate={dummyChatRoom.isPrivate}
                password={dummyChatRoom.password}
              />
              <ChatRoomItem
                title={dummyChatRoom.title}
                owner={dummyChatRoom.owner}
                isPrivate={false}
                password={dummyChatRoom.password}
              />
              <ChatRoomItem
                title={dummyChatRoom.title}
                owner={dummyChatRoom.owner}
                isPrivate={dummyChatRoom.isPrivate}
                password={dummyChatRoom.password}
              />
              <ChatRoomItem
                title={dummyChatRoom.title}
                owner={dummyChatRoom.owner}
                isPrivate={dummyChatRoom.isPrivate}
                password={dummyChatRoom.password}
              />
              <ChatRoomItem
                title={dummyChatRoom.title}
                owner={dummyChatRoom.owner}
                isPrivate={dummyChatRoom.isPrivate}
                password={dummyChatRoom.password}
              />
              <ChatRoomItem
                title={dummyChatRoom.title}
                owner={dummyChatRoom.owner}
                isPrivate={dummyChatRoom.isPrivate}
                password={dummyChatRoom.password}
              />
              <ChatRoomItem
                title={dummyChatRoom.title}
                owner={dummyChatRoom.owner}
                isPrivate={dummyChatRoom.isPrivate}
                password={dummyChatRoom.password}
              />
              <ChatRoomItem
                title={dummyChatRoom.title}
                owner={dummyChatRoom.owner}
                isPrivate={dummyChatRoom.isPrivate}
                password={dummyChatRoom.password}
              />
            </SimpleGrid>
          </Box>
          <Box>
            <CustomButton size="lg" onClick={() => {}}>
              CREATE
            </CustomButton>
          </Box>
        </VStack>
        <VStack w="25%" h="90%" m={10} p={7} backgroundColor="white">
          <VStack w="100%" overflowY="scroll">
            <UserItem user={friend} />
            <UserItem user={friend} />
            <UserItem user={friend} />
            <UserItem user={friend} />
            <UserItem user={friend} />
            <UserItem user={friend} />
            <UserItem user={friend} />
            <UserItem user={friend} />
          </VStack>
        </VStack>
      </Flex>
    </>
  );
}

ChatPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
