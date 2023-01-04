import { ChatRoomItem } from '@/components/ChatRoomItem';
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
  ModalCloseButton,
} from '@chakra-ui/react';
import Head from 'next/head';
import { ReactElement, ReactEventHandler, ReactNode, useEffect, useRef, useState } from 'react';
import { allUserStore } from '@/stores/allUserStore';
import Link from 'next/link';
import RawUserItem from '@/components/RawUserItem';
import { chatStore } from '@/stores/chatStore';
import { useRouter } from 'next/router';
import { ChatRoomStatus } from '@/interfaces/ChatRoomProps';

export default function ChatPage() {
  const { allUsers, getAllUsers } = allUserStore();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: privIsOpen, onOpen: privOnOpen, onClose: privOnClose } = useDisclosure();
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  const [valueTitle, setValueTitle] = useState('');
  const [valuePassword, setValuePassword] = useState('');
  const [valuePasswordPriv, setValuePasswordPriv] = useState('');
  const [roomPrivate, setRoomPrivate] = useState(false);
  const handleTitle = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValueTitle(event.target.value);
  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValuePassword(event.target.value);

  const handleRoomPrivate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomPrivate(event.target.checked);
    setValuePassword('');
  };

  const handlePrivPassword = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValuePasswordPriv(event.target.value);

  const { socket, makeSocket, refreshChatRoomList, chatRoomList } = chatStore();
  const router = useRouter();

  useEffect(() => {
    getAllUsers();
    if (socket === undefined) {
      makeSocket();
    }
    refreshChatRoomList();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      console.log('refreshed');
      refreshChatRoomList();
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const createChatRoom = () => {
    if (valueTitle === '') {
      alert('방 제목을 입력해주십시오.');
      return;
    }
    if (roomPrivate && valuePassword === '') {
      alert('비밀번호를 입력해주십시오.');
      return;
    }
    if (socket === undefined) {
      console.log('socket is undefined!');
      return;
    }

    socket.emit('createChatRoom', {
      name: valueTitle,
      status: roomPrivate ? ChatRoomStatus.PROTECTED : ChatRoomStatus.PUBLIC,
      password: valuePassword,
    });
    socket.once('createChatRoom', (res) => {
      router.push(`/chat/${res.chatRoom.id}`);
    });
    onClose();
  };

  const joinChatRoom = (id: number) => {
    socket?.emit('join', { id, password: '' });
  };

  //TODO: 비밀번호 맞춰보는 로직 필요한 부분
  const joinPrivChatRoom = (id: number) => {
    console.log(valuePasswordPriv);
    if (valuePasswordPriv === '') {
      alert('비밀번호를 입력해주십시오.');
      return;
    }
    // if (valuePa  ~~~~~ !== ~~~~ )
    socket?.emit('join', { id, password: valuePasswordPriv });

    privOnClose();
    setValuePasswordPriv('');
    router.push(`/chat/${id}`);
  };

  const privChatRoomID = useRef(0);

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
              {chatRoomList.map((chatRoom, idx) => (
                <Box
                  key={idx}
                  onClick={() => {
                    if (!chatRoom.isPrivate) {
                      joinChatRoom(chatRoom.id);
                      router.push(`/chat/${chatRoom.id}`);
                    } else {
                      // TODO:  비밀번호 입력 모달 제작하기
                      privChatRoomID.current = chatRoom.id;
                      privOnOpen();
                    }
                  }}
                >
                  <ChatRoomItem
                    id={chatRoom.id}
                    title={chatRoom.title}
                    owner={chatRoom.owner}
                    isPrivate={chatRoom.isPrivate}
                  />
                </Box>
              ))}
            </SimpleGrid>
          </Box>
          <Box>
            <CustomButton size="lg" onClick={onOpen}>
              CREATE
            </CustomButton>
          </Box>
        </VStack>
        <VStack w="25%" h="90%" m={10} p={7} backgroundColor="white" borderRadius={'25px'}>
          <VStack w="100%" overflowY="scroll">
            {/* 향후에 유저 상태에 따라 불러오는거 달라지면 이부분 filter 수정 */}
            {allUsers
              .filter((user) => user.status === 0)
              .map((user, index) => (
                <Link key={index} href={`/user/${user.name}`}>
                  <Flex width={'200px'}>
                    <RawUserItem user={user} />
                  </Flex>
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
                <ModalHeader>
                  <ModalCloseButton />
                </ModalHeader>
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
                          disabled={!roomPrivate}
                          bg={!roomPrivate ? 'gray.200' : 'white'}
                          value={valuePassword}
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

                    <CustomButton size="lg" onClick={createChatRoom}>
                      CREATE
                    </CustomButton>
                  </VStack>
                </ModalFooter>
              </VStack>
            </HStack>
          </Center>
        </ModalContent>
      </Modal>

      {/* Private Room Password Insert Modal */}
      <Modal
        isOpen={privIsOpen}
        onClose={() => {
          setValuePasswordPriv('');
          privOnClose();
        }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent bg="white" color="black" borderRadius={30}>
          <Center>
            <HStack>
              <VStack>
                <ModalHeader>
                  <ModalCloseButton />
                </ModalHeader>
                <ModalBody>
                  <HStack spacing={3}>
                    <VStack spacing={6}>
                      {/* <Text>TITLE</Text> */}
                      <HStack>
                        <Text>PASSWORD</Text>
                        {/* <Checkbox onChange={handleRoomPrivate} /> */}
                      </HStack>
                    </VStack>
                    <VStack>
                      {/* <Input
                        variant="outline"
                        placeholder="enter title"
                        onChange={handlePrivPassword}
                      /> */}

                      <InputGroup size="md">
                        <Input
                          pr="4.5rem"
                          type={show ? 'text' : 'password'}
                          placeholder="enter password"
                          onChange={handlePrivPassword}
                          // disabled={!roomPrivate}
                          // bg={!roomPrivate ? 'gray.200' : 'white'}
                          value={valuePasswordPriv}
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
                    <CustomButton
                      size="lg"
                      onClick={() => {
                        joinPrivChatRoom(privChatRoomID.current);
                      }}
                    >
                      SUBMIT
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
