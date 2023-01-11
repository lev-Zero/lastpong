import MainLayout from '@/layouts/MainLayout';
import {
  Center,
  Flex,
  HStack,
  Spacer,
  VStack,
  Image,
  Input,
  Spinner,
  Box,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Checkbox,
  Text,
  InputGroup,
  InputRightElement,
  Button,
  ModalFooter,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, {
  ReactElement,
  useState,
  useRef,
  useEffect,
  LegacyRef,
  useLayoutEffect,
} from 'react';
import { userStore } from '@/stores/userStore';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import { MsgProps } from '@/interfaces/MsgProps';
import { chatStore } from '@/stores/chatStore';
import { ChatRoomProps, ChatRoomStatus } from '@/interfaces/ChatRoomProps';
import { ChatUserItemProps, ChatUserStatus } from '@/interfaces/ChatUserItemProps';
import ChatUserItem from '@/components/ChatUserItem';
import { convertRawUserToUser, RawUserProps } from '@/utils/convertRawUserToUser';
import { CustomButton } from '@/components/CustomButton';

export default function ChatRoomPage() {
  const router = useRouter();
  // const [roomNo, setRoomNo] = useState<number>();
  const { roomNo, updateRoomNo, resetRoomNo } = chatStore();
  const [msg, setMsg] = useState<string>('');
  const { me, blockedUsers } = userStore();
  const [myChatUserStatus, setMyChatUserStatus] = useState<ChatUserStatus>(ChatUserStatus.COMMON);
  const inputRef = useRef<HTMLInputElement>(null);

  const [chatRoom, setChatRoom] = useState<ChatRoomProps>();
  const [chatUserList, setChatUserList] = useState<ChatUserItemProps[]>([]);
  const { socket } = chatStore();

  const [msgList, setMsgList] = useState<MsgProps[]>([]);
  const [mutedTime, setMutedTime] = useState<Date>(new Date());

  const messageBoxRef = useRef<HTMLDivElement>(null);

  const {
    isOpen: isSettingModalOpen,
    onOpen: onSettingModalOpen,
    onClose: onSettingModalClose,
  } = useDisclosure();

  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  };

  useLayoutEffect(() => {
    console.log('chatRoom Mounted!');
    return () => {
      if (socket === undefined) {
        console.log('socket is undefined');
        return;
      }
      console.log('roomNo', roomNo);
      console.log('socket', socket);
      socket.emit('leave', { targetUserId: me.id, chatRoomId: roomNo });

      socket.off('join');
      socket.off('admin');
      socket.off('ban');
      socket.off('mute');
      socket.off('leave');
      resetRoomNo();
      console.log('chatRoom unMounted!');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [msgList]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    // setRoomNo(parseInt(router.query.roomNo as string));
    if (parseInt(router.query.roomNo as string) !== undefined)
      updateRoomNo(parseInt(router.query.roomNo as string));
  }, [router.isReady]);

  useEffect(() => {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (roomNo === undefined) {
      return;
    }
    socket.on('message', (res) => {
      // Block한 유저가 단체 채팅방에서 보낸 메시지는 표시하지 않음
      console.log('blockedUsers!', blockedUsers); // FIXME: blockedUsers가 바뀌었는데 왜 여기선 반영 안되는지...?
      if (blockedUsers.some(({ name }) => name === res.user.username)) {
        return;
      }
      setMsgList((prev) => {
        return [
          ...prev,
          {
            username: res.user.username,
            text: res.message,
          },
        ];
      });
    });

    socket.on('chatRoomById', async (res) => {
      const newChatRoom = res.chatRoom;
      const mutedUsers: UserProps[] = await Promise.all(
        newChatRoom.mutedUser.map((rawMutedUser: any) => convertRawUserToUser(rawMutedUser.user))
      );
      const bannedUsers: UserProps[] = await Promise.all(
        newChatRoom.bannedUser.map((rawBannedUser: any) => convertRawUserToUser(rawBannedUser.user))
      );
      const joinedUsers: UserProps[] = await Promise.all(
        newChatRoom.joinedUser.map((rawJoinedUser: any) => convertRawUserToUser(rawJoinedUser.user))
      );
      const adminUsers: UserProps[] = await Promise.all(
        newChatRoom.adminUser.map((rawAdminUser: any) => convertRawUserToUser(rawAdminUser.user))
      );
      const owner: UserProps = await convertRawUserToUser(newChatRoom.owner);

      setMyChatUserStatus(ChatUserStatus.COMMON);
      adminUsers.forEach((user) => {
        if (user.id === me.id) {
          setMyChatUserStatus(ChatUserStatus.ADMIN);
        }
      });
      if (owner.id === me.id) {
        setMyChatUserStatus(ChatUserStatus.OWNER);
      }

      setChatRoom({
        name: newChatRoom.name,
        status: newChatRoom.status,
        mutedUsers,
        bannedUsers,
        joinedUsers,
        adminUsers,
        owner,
      });
    });

    return () => {
      socket.off('message');
      socket.off('chatRoomById');
    };
  }, [roomNo]);

  useEffect(() => {
    function convertToChatUserList(chatRoom: ChatRoomProps) {
      const ret: ChatUserItemProps[] = [];
      const usedIds: number[] = [];
      ret.push({
        myChatUserStatus,
        user: chatRoom.owner,
        isMuted: chatRoom.mutedUsers.some(({ id }) => id === chatRoom.owner.id),
        role: ChatUserStatus.OWNER,
        roomNo,
      });
      usedIds.push(chatRoom.owner.id);
      chatRoom.adminUsers.forEach((user: UserProps) => {
        if (!usedIds.includes(user.id)) {
          ret.push({
            myChatUserStatus,
            user,
            isMuted: chatRoom.mutedUsers.some(({ id }) => id === user.id),
            role: ChatUserStatus.ADMIN,
            roomNo,
          });
          usedIds.push(user.id);
        }
      });
      chatRoom.joinedUsers.forEach((user: UserProps) => {
        if (!usedIds.includes(user.id)) {
          ret.push({
            myChatUserStatus,
            user,
            isMuted: chatRoom.mutedUsers.some(({ id }) => id === user.id),
            role: ChatUserStatus.COMMON,
            roomNo,
          });
          usedIds.push(user.id);
        }
      });
      return ret;
    }
    if (chatRoom) {
      setChatUserList(convertToChatUserList(chatRoom));
    }
  }, [chatRoom]);

  useEffect(() => {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (roomNo === undefined) {
      return;
    }
    socket.emit('chatRoomById', { chatRoomId: roomNo });
  }, [roomNo]);

  useEffect(() => {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (roomNo === undefined) {
      return;
    }
    socket.on('join', (res) => {
      console.log(res);
      socket.emit('chatRoomById', { chatRoomId: roomNo });
    });

    socket.on('admin', (res) => {
      console.log(res.message);
      socket.emit('chatRoomById', { chatRoomId: roomNo });
    });
    socket.on('mute', ({ message, chatRoom, mutedUser }) => {
      console.log(message);
      socket.emit('chatRoomById', { chatRoomId: roomNo });

      if (mutedUser.id !== me.id) {
        return;
      }
      if (message.includes('추가')) {
        const foundItem = chatRoom.muted.find((muted: any) => muted.user.username === me.name);
        if (foundItem === undefined) {
          return;
        }
        setMutedTime(new Date(foundItem.endTime));
      } else {
        setMutedTime(new Date());
      }
    });
    socket.on('ban', (res) => {
      console.log(res.message);
      if (res.bannedUser.id === me.id) {
        exitChatRoom();
        return;
      }
      socket.emit('chatRoomById', { chatRoomId: roomNo });
    });
    socket.on('leave', async (res) => {
      const message: string = res.message;
      console.log(message);
      if (message.substring(0, 5) == 'owner') {
        // FIXME: 이 방식으로 방 폭파를 결정하는 건 ad-hoc
        exitChatRoom();
      }
      socket.emit('chatRoomById', { chatRoomId: roomNo });
    });

    return () => {
      socket.off('join');
      socket.off('admin');
      socket.off('ban');
      socket.off('mute');
      socket.off('leave');
    };
  }, [roomNo]);

  function exitChatRoom() {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }

    socket.emit('leave', { targetUserId: me.id, chatRoomId: roomNo });
    router.push('/chat');
  }

  function checkIfMuted() {
    if (mutedTime === undefined) return -1;
    const nowTime = new Date();
    const leftTime = mutedTime.getTime() - nowTime.getTime();
    return leftTime;
  }

  function handleSendButtonClicked() {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    setMsg('');
    if (inputRef.current !== null) inputRef.current.focus();
    const leftTime = checkIfMuted();
    if (leftTime > 0) {
      const second = Math.floor(leftTime / 1000);
      alert(`${second} 초 후에 채팅 가능`);
      return;
    }
    socket.emit('message', { chatRoomId: roomNo, message: msg });
  }

  function handleEnterKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (e.nativeEvent.isComposing) {
      return;
    }
    if (e.key === 'Enter') {
      console.log(msg);
      setMsg('');
      const leftTime = checkIfMuted();
      if (leftTime > 0) {
        const second = Math.floor(leftTime / 1000);
        alert(`${second} 초 후에 채팅 가능`);
        return;
      }

      socket.emit('message', { chatRoomId: roomNo, message: msg });
    }
  }

  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const [valuePassword, setValuePassword] = useState('');
  const [roomProtected, setRoomProtected] = useState(false);
  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValuePassword(event.target.value);

  const handleRoomProtected = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomProtected(event.target.checked);
    setValuePassword('');
  };

  const updateChatRoomPassword = () => {
    if (roomProtected && valuePassword === '') {
      alert('비밀번호를 입력해주십시오.');
      return;
    }
    if (roomProtected && valuePassword.search(/[^A-Za-z0-9ㄱ-ㅎ가-힣]/) > -1) {
      alert('비밀번호에는 한글/영어/숫자만 이용할 수 있습니다');
      return;
    }
    if (socket === undefined) {
      console.log('socket is undefined!');
      return;
    }
    if (chatRoom === undefined || roomNo === undefined) {
      return;
    }

    const newChatRoomStatus: ChatRoomStatus = !roomProtected
      ? ChatRoomStatus.PUBLIC
      : ChatRoomStatus.PROTECTED;

    console.log('chatRoom.status', chatRoom.status);
    console.log('newChatRoom.status', newChatRoomStatus);
    console.log('valuePassword', valuePassword);

    if (newChatRoomStatus !== chatRoom.status) {
      socket.emit('updateStatus', { chatRoomId: roomNo, status: newChatRoomStatus }, console.log);
      socket.once('updateStatus', ({ message }) => {
        console.log(message);
        if (newChatRoomStatus === ChatRoomStatus.PUBLIC) {
          handleSettingModalClose();
          return;
        }
        socket.emit('updatePwd', { chatRoomId: roomNo, newPwd: valuePassword }, console.log);
        socket.once('updatePwd', ({ message }) => {
          console.log(message);
        });
      });
    }
    if (newChatRoomStatus === ChatRoomStatus.PUBLIC) {
      handleSettingModalClose();
      return;
    }
    socket.emit('updatePwd', { chatRoomId: roomNo, newPwd: valuePassword }, console.log);
    socket.once('updatePwd', ({ message }) => {
      console.log(message);
    });
    handleSettingModalClose();
  };

  function handleSettingModalClose() {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (roomNo === undefined) {
      console.log('roomNo is undefined');
      return;
    }
    socket.emit('chatRoomById', { chatRoomId: roomNo });
    setRoomProtected(false);
    setValuePassword('');
    onSettingModalClose();
  }

  return (
    <>
      {chatRoom === undefined ? (
        <Center w="full" h="full">
          <Spinner size="xl" thickness="4px" color="main" />
        </Center>
      ) : (
        <>
          <Head>
            <title>{`${chatRoom.name} | LastPong`}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Flex w="100%" h="100%" p={5}>
            <VStack w="70%" h="90%" my={10} bg="white" borderRadius="42px" border="2px">
              <Flex w="full" py={5} bg="main" color="white" borderTopRadius="40px" fontSize="3xl">
                <Center ml={20}>{chatRoom.name}</Center>
                {chatRoom.status === ChatRoomStatus.PROTECTED ? (
                  <Image ml={4} src="/lock-white.svg" />
                ) : null}
                <Spacer />
                {myChatUserStatus === ChatUserStatus.OWNER ? (
                  <Image w="40px" src="/chatroom-setting.svg" onClick={onSettingModalOpen} />
                ) : null}
                <Image w="30px" mx={10} src="/exit.svg" onClick={exitChatRoom} />
              </Flex>
              {/* Chat Part */}
              <VStack p={5} w="full" mt={10} bg="white" overflow="scroll" ref={messageBoxRef}>
                <>
                  {msgList.map((msg, idx) =>
                    msg.username === me.name ? (
                      <Flex key={idx} width="100%">
                        <Spacer />
                        <Flex p={3} borderRadius="20px" bg={'main'} color={'white'} fontSize="2xl">
                          {msg.text}
                        </Flex>
                      </Flex>
                    ) : (
                      <Flex key={idx} width="100%">
                        <Flex p={3} borderRadius="20px" bg="gray.200" color="black" fontSize="2xl">
                          {msg.text}
                        </Flex>
                        <Spacer />
                      </Flex>
                    )
                  )}
                </>
              </VStack>
              <Spacer />
              <HStack w="full" p={5}>
                <Input
                  pl="40px"
                  mr="20px"
                  h="60px"
                  borderRadius="20px"
                  bg="gray.100"
                  fontSize="2xl"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setMsg(e.target.value);
                  }}
                  onKeyDown={handleEnterKeyDown}
                  value={msg}
                  autoFocus
                  ref={inputRef}
                />
                <Image w="50px" src="/send-button.svg" onClick={handleSendButtonClicked} />
              </HStack>
            </VStack>
            <VStack
              w="25%"
              h="90%"
              m={10}
              p={7}
              backgroundColor="white"
              borderRadius="20px"
              overflow="scroll"
            >
              {chatUserList.map((chatUserItem, idx) => (
                <ChatUserItem
                  key={idx}
                  myChatUserStatus={myChatUserStatus}
                  user={chatUserItem.user}
                  isMuted={chatUserItem.isMuted}
                  role={chatUserItem.role}
                  roomNo={roomNo}
                />
              ))}
            </VStack>
          </Flex>
          {/* 방 설정 변경 */}
          <Modal isOpen={isSettingModalOpen} onClose={handleSettingModalClose} isCentered>
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
                          <HStack>
                            <Text>PASSWORD</Text>
                            <Checkbox onChange={handleRoomProtected} />
                          </HStack>
                        </VStack>
                        <VStack>
                          <InputGroup size="md">
                            <Input
                              pr="4.5rem"
                              type={show ? 'text' : 'password'}
                              placeholder="enter password"
                              onChange={handlePassword}
                              disabled={!roomProtected}
                              bg={!roomProtected ? 'gray.200' : 'white'}
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
                        <CustomButton size="lg" onClick={updateChatRoomPassword}>
                          UPDATE
                        </CustomButton>
                      </VStack>
                    </ModalFooter>
                  </VStack>
                </HStack>
              </Center>
            </ModalContent>
          </Modal>
        </>
      )}
    </>
  );
}

ChatRoomPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
