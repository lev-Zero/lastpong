import { ChatRoomItem } from '@/components/ChatRoomItem';
import { CustomButton } from '@/components/CustomButton';
import MainLayout from '@/layouts/MainLayout';

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
import Link from 'next/link';
import RawUserItem from '@/components/RawUserItem';
import { chatStore } from '@/stores/chatStore';
import { useRouter } from 'next/router';
import { ChatRoomStatus } from '@/interfaces/ChatRoomProps';
import { UserStatus } from '@/interfaces/UserProps';
import { userStore } from '@/stores/userStore';

export default function ChatPage() {
  const { allUsers, fetchAllUsers } = userStore();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: privIsOpen, onOpen: privOnOpen, onClose: privOnClose } = useDisclosure();
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  const [valueTitle, setValueTitle] = useState('');
  const [valuePassword, setValuePassword] = useState('');
  const [valuePasswordPriv, setValuePasswordPriv] = useState('');
  const [roomProtected, setRoomProtected] = useState(false);
  const handleTitle = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValueTitle(event.target.value);
  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValuePassword(event.target.value);

  const handleRoomProtected = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomProtected(event.target.checked);
    setValuePassword('');
  };

  const handlePrivPassword = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValuePasswordPriv(event.target.value);

  const { socket, makeSocket, refreshChatRoomList, chatRoomList } = chatStore();
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (socket === undefined) {
      makeSocket();
    }
    refreshChatRoomList();
  }, []);

  useEffect(() => {
    // TODO: 채팅 참여자가 실시간으로 변경되지는 않음
    fetchAllUsers().catch(console.log);
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
    if (roomProtected && valuePassword === '') {
      alert('비밀번호를 입력해주십시오.');
      return;
    }
    if (socket === undefined) {
      console.log('socket is undefined!');
      return;
    }
    if (valueTitle.search(/[^A-Za-z0-9ㄱ-ㅎ가-힣]/) > -1) {
      alert('제목에는 한글/영어/숫자만 이용할 수 있습니다');
      return;
    }
    if (roomProtected && valuePassword.search(/[^A-Za-z0-9ㄱ-ㅎ가-힣]/) > -1) {
      alert('비밀번호에는 한글/영어/숫자만 이용할 수 있습니다');
      return;
    }

    socket.emit('createChatRoom', {
      name: valueTitle,
      status: roomProtected ? ChatRoomStatus.PROTECTED : ChatRoomStatus.PUBLIC,
      password: valuePassword,
    });
    socket.once('createChatRoom', (res) => {
      console.log(res);
      console.log(roomProtected);
      router.push(`/chat/${res.chatRoom.id}`);
    });
    onClose();
  };

  const joinChatRoom = (id: number) => {
    socket?.emit('join', { chatRoomId: id, password: '' }, (res: any) => {
      console.log(res);
      if (!res.error) {
        router.push(`/chat/${id}`);
      } else {
        alert(res.message);
      }
    });
  };

  const joinPrivChatRoom = (id: number) => {
    if (valuePasswordPriv === '') {
      alert('비밀번호를 입력해주십시오.');
      return;
    }
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }

    socket.emit('join', { chatRoomId: id, password: valuePasswordPriv }, (res: any) => {
      // console.log(res);
      if (!res.error) {
        privOnClose();
        router.push(`/chat/${id}`);
      } else {
        alert('비밀번호가 틀렸습니다!'); // TODO: UI 개선 (OTP 틀렸을 때처럼)
        setValuePasswordPriv('');
      }
    });
  };

  const privChatRoomID = useRef(0);

  function handleEnterKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (e.key === 'Enter') {
      createChatRoom();
    }
  }
  function handleEnterKeyDownPriv(e: React.KeyboardEvent<HTMLElement>, id: number) {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (e.key === 'Enter') {
      joinPrivChatRoom(id);
    }
  }

  useEffect(() => {
    if (roomProtected === false) return;
    if (inputRef.current !== null) inputRef.current.focus();
  }, [roomProtected]);
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
                  _hover={{
                    color: 'teal.500',
                  }}
                  _active={{
                    color: 'blue.500',
                  }}
                  onClick={() => {
                    if (!chatRoom.isProtected) {
                      joinChatRoom(chatRoom.id);
                    } else {
                      privChatRoomID.current = chatRoom.id;
                      privOnOpen();
                    }
                  }}
                >
                  <ChatRoomItem
                    id={chatRoom.id}
                    title={chatRoom.title}
                    owner={chatRoom.owner}
                    isProtected={chatRoom.isProtected}
                  />
                </Box>
              ))}
            </SimpleGrid>
          </Box>
          <Box>
            <CustomButton
              size="lg"
              onClick={() => {
                onOpen();
                // if (inputRef.current !== null) inputRef.current.focus();
              }}
            >
              CREATE
            </CustomButton>
          </Box>
        </VStack>
        <VStack w="25%" h="90%" m={10} p={7} backgroundColor="white" borderRadius={'25px'}>
          <VStack w="100%" overflowY="scroll">
            {allUsers
              .filter((user) => user.status === UserStatus.ONLINE)
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
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setValuePassword('');
          setValueTitle('');
          setRoomProtected(false);
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
                      <Text>TITLE</Text>
                      <HStack>
                        <Text>PASSWORD</Text>
                        <Checkbox onChange={handleRoomProtected} />
                      </HStack>
                    </VStack>
                    <VStack>
                      <Input
                        variant="outline"
                        placeholder="enter title"
                        onChange={handleTitle}
                        onKeyDown={handleEnterKeyDown}
                        autoFocus
                      />

                      <InputGroup size="md">
                        <Input
                          pr="4.5rem"
                          type={show ? 'text' : 'password'}
                          placeholder="enter password"
                          onChange={handlePassword}
                          disabled={!roomProtected}
                          bg={!roomProtected ? 'gray.200' : 'white'}
                          value={valuePassword}
                          onKeyDown={handleEnterKeyDown}
                          ref={inputRef}
                          autoFocus
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
                          onKeyDown={(e) => handleEnterKeyDownPriv(e, privChatRoomID.current)}
                          autoFocus
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
