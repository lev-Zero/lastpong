import { ChatRoomItem, ChatRoomItemProps } from '@/components/ChatRoomItem';
import { CustomButton } from '@/components/CustomButton';
import UserItem from '@/components/UserItem';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import MainLayout from '@/layouts/MainLayout';
import { customFetch } from '@/utils/customFetch';
import {
  Button,
  Center,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  useDisclosure,
  VStack,
  Text,
  Box,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Checkbox,
} from '@chakra-ui/react';
import Head from 'next/head';
import { ReactElement, ReactEventHandler, ReactNode, useEffect, useState } from 'react';
import { allUserStore } from '@/stores/allUserStore';
import Link from 'next/link';
import RawUserItem from '@/components/RawUserItem';
export default function ChatPage() {
  const { allUsers, getAllUsers } = allUserStore();

  //전체 유저를 불러온 후 온라인 상태인 유저만 띄워야함 혹은 채팅방에있던지
  useEffect(() => {
    getAllUsers;
  }, []);
  const friend: UserProps = {
    name: 'yopark',
    imgUrl: '',
    status: UserStatus.inGame,
    rating: 1028,
  };

  const owner: UserProps = {
    name: 'yopark',
    imgUrl: '',
    status: UserStatus.inGame,
    rating: 1028,
  };

  const dummyChatRoom: ChatRoomItemProps = {
    title: 'Lonely Night Chat',
    owner: owner,
    isPrivate: true,
    password: '1234',
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  const [valueTitle, setValueTitle] = useState('');
  const [valuePassword, setValuePassword] = useState('');
  const [roomPrivate, setRoomPrivate] = useState(false);
  const handleTitle = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValueTitle(event.target.value);
  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValuePassword(event.target.value);
  const handleRoomPrivate = (event: React.ChangeEvent<HTMLInputElement>) =>
    setRoomPrivate(event.target.checked);

  const sendAndClose = () => {
    console.log('title : ', valueTitle);
    console.log('password : ', valuePassword);
    console.log('roomPrivate : ', roomPrivate);
    if (valueTitle && valuePassword) {
      onClose();
    }
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
            <CustomButton size="lg" onClick={onOpen}>
              CREATE
            </CustomButton>
          </Box>
        </VStack>
        <VStack w="25%" h="90%" m={10} p={7} backgroundColor="white">
          <VStack w="100%" overflowY="scroll">
            {/* 향후에 유저 상태에 따라 불러오는거 달라지면 이부분 filter 수정 */}
            {allUsers
              .filter((user) => user.status === 0)
              .map((user, index) => (
                <Link key={index} href={`/user/${user.name}`}>
                  <RawUserItem user={user} />
                </Link>
              ))}
          </VStack>
        </VStack>
      </Flex>

      {/* 방생성 모달 파트 */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="white" color="black" borderRadius={30}>
          <Center>
            <HStack>
              <VStack>
                <ModalHeader></ModalHeader>
                <ModalBody>
                  <HStack spacing={3}>
                    <VStack spacing={6}>
                      <Text>TITLE</Text>
                      <HStack>
                        <Text>PASSWORD</Text>
                        <Checkbox onChange={handleRoomPrivate} />
                      </HStack>
                    </VStack>
                    <VStack>
                      <Input variant="outline" placeholder="enter title" onChange={handleTitle} />

                      <InputGroup size="md">
                        <Input
                          pr="4.5rem"
                          type={show ? 'text' : 'password'}
                          placeholder="enter password"
                          onChange={handlePassword}
                        />
                        <InputRightElement width="4.5rem">
                          <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? 'hide' : 'Show'}
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                    </VStack>
                  </HStack>
                </ModalBody>
                <ModalFooter>
                  <VStack mb={'7'}>
                    {/* TODO:onclick 핸들러로 매치 잡는 기능 연결해야함 현재는 콘솔에 정보만 띄움 */}

                    <CustomButton size="lg" onClick={sendAndClose}>
                      CREATE
                    </CustomButton>
                  </VStack>
                </ModalFooter>
              </VStack>
            </HStack>
          </Center>
        </ModalContent>
      </Modal>
    </>
  );
}

ChatPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
