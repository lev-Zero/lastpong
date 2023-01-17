import { userStore } from '@/stores/userStore';
import {
  VStack,
  Text,
  Flex,
  Spacer,
  Box,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Image,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Link,
  ModalOverlay,
  Center,
  Spinner,
  ModalFooter,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import UserItem from './UserItem';
import RawUserItem from './RawUserItem';
import { chatStore } from '@/stores/chatStore';
import { gameStore } from '@/stores/gameStore';
import { sleep } from '@/utils/sleep';
import { UserProps } from '@/interfaces/UserProps';
import { fetchUserById } from '@/utils/fetchUserById';
import CustomAvatar from './CustomAvatar';
import { CustomButton } from './CustomButton';
import { useRouter } from 'next/router';

function InvitingModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { socket: chatSocket, isInvited, inviteData } = chatStore();
  const {
    socket: gameSocket,
    room,
    isCreated,
    setIsCreated,
    isSetting,
    setIsSetting,
  } = gameStore();
  const router = useRouter();

  // isSetting -> /game/options 페이지로 1회 라우팅
  useEffect(() => {
    if (isSetting) {
      router.push('/game/options');
      console.log('/game/options로 이동...');
      setIsSetting(false);
    }
  }, [isSetting]);

  useEffect(() => {
    if (isInvited === 0) onClose();
    if (isInvited === 2 || isInvited === 3) {
      onOpen();
      if (isInvited === 3 && gameSocket !== undefined) {
        console.log('EMIT CHAT : createGameRoom');
        sleep(400).then(() => {
          gameSocket.emit('createGameRoom');
          onClose();
        });
      }
    } else return;
  }, [isInvited]);

  useEffect(() => {
    if (chatSocket === undefined || !chatSocket.connected) {
      console.log('chatSocket is not ready');
      return;
    }
    if (gameSocket === undefined || !gameSocket.connected) {
      console.log('gameSocket is not ready');
      return;
    }
    if (isCreated === 0) {
      console.log('inviteGameRoomInfo: Create Message Not Yet..');
      return;
    }
    if (inviteData === undefined) {
      console.log('inviteData is undefined');
      return;
    }
    chatSocket.emit('inviteGameRoomInfo', {
      randomInviteRoomName: inviteData.randomInviteRoomName,
      inviteGameRoomName: room.gameRoomName,
      hostId: inviteData.hostId,
      targetId: inviteData.targetId,
    });
    gameSocket.emit('joinGameRoom', {
      gameRoomName: room.gameRoomName,
    });
    setIsCreated(0);
  }, [isCreated]);

  return (
    <Modal
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent bg="win" color="white" p={20} borderRadius={30}>
        <Center>
          <VStack>
            <ModalBody textAlign="center" fontSize="6xl">
              INVITING USER...
            </ModalBody>
          </VStack>
        </Center>
      </ModalContent>
    </Modal>
  );
}

function InvitedModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isInvited, inviteData, socket: chatSocket, setIsInvited } = chatStore();
  const { isSetting, setIsSetting } = gameStore();
  const router = useRouter();

  const [invitingUser, setInvitingUser] = useState<UserProps>();

  // isSetting -> /game/options 페이지로 1회 라우팅
  useEffect(() => {
    if (isSetting) {
      router.push('/game/options');
      console.log('/game/options로 이동...');
      setIsSetting(false);
    }
  }, [isSetting]);

  useEffect(() => {
    if (inviteData === undefined) {
      return;
    }
    fetchUserById(inviteData.hostId).then(setInvitingUser);
  }, [inviteData]);

  useEffect(() => {
    if (isInvited === 1) {
      console.log(inviteData);
      onOpen();
    } else return;
  }, [isInvited]);

  function handleMatchBtnClicked() {
    if (chatSocket === undefined || !chatSocket.connected) {
      console.log('socket is not ready');
      return;
    }
    if (isInvited !== 1 || inviteData === undefined) {
      console.log('isInvited is not 1 or inviteData is undefined');
      return;
    }

    chatSocket.emit('responseInvite', {
      response: true,
      randomInviteRoomName: inviteData.randomInviteRoomName,
      hostId: inviteData.hostId,
      targetId: inviteData.targetId,
    });
    onClose();
  }

  function handleMatchCancelBtnClicked() {
    if (chatSocket === undefined || !chatSocket.connected) {
      console.log('socket is not ready');
      return;
    }
    if (isInvited !== 1 || inviteData === undefined) {
      console.log('isInvited is not 1 or inviteData is undefined');
      return;
    }
    chatSocket.emit('responseInvite', {
      response: false,
      randomInviteRoomName: inviteData.randomInviteRoomName,
      hostId: inviteData.hostId,
      targetId: inviteData.targetId,
    });
    setIsInvited(0);
    onClose();
  }

  return (
    <Modal
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bg="win" color="white" borderRadius={30}>
        {invitingUser === undefined ? (
          <Spinner />
        ) : (
          <VStack m="10">
            <ModalBody>
              <VStack>
                <HStack>
                  <Box mr={5}>
                    <CustomAvatar
                      url={invitingUser.imgUrl}
                      size="lg"
                      status={invitingUser.status}
                    />
                  </Box>
                  <VStack>
                    <Text fontSize="3xl">{invitingUser.name.toUpperCase()}</Text>
                    <Text>RATING {invitingUser.rating}</Text>
                  </VStack>
                </HStack>
                <Text fontSize="5xl">INVITED YOU</Text>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <VStack>
                <CustomButton size="lg" onClick={handleMatchBtnClicked}>
                  MATCH
                </CustomButton>
                <CustomButton
                  size="lg"
                  onClick={handleMatchCancelBtnClicked}
                  btnStyle={{
                    background: 'transparent',
                  }}
                >
                  CANCEL
                </CustomButton>
              </VStack>
            </ModalFooter>
          </VStack>
        )}
      </ModalContent>
    </Modal>
  );
}

function FindUserModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { me, allUsers, fetchAllUsers } = userStore();
  const [nameInput, setNameInput] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAllUsers().catch(console.log);
  }, []);

  return (
    <>
      <Image
        src="/add-friend.svg"
        w={10}
        h={10}
        p={1}
        mt={1}
        borderRadius={7}
        bg="main"
        alt="add friend"
        onClick={onOpen}
        mr="5px"
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalContent
          bg="white"
          color="black"
          left="5%"
          maxWidth="40vw"
          h="50vh"
          borderRadius="30px"
          overflow="hidden"
          border="1px"
        >
          <ModalHeader bg="main" borderBottom="1px">
            <HStack>
              <Flex h="80px" p="10px">
                <InputGroup>
                  <InputLeftElement>
                    <Image
                      style={{
                        position: 'absolute',
                        top: '85%',
                        left: '160%',
                        transform: 'translate(-50%, -50%)',
                      }}
                      src="/search.svg"
                      alt="search icon"
                      color={'black'}
                    />
                  </InputLeftElement>
                  <Input
                    bg="white"
                    left="30px"
                    width="33vw"
                    h="full"
                    pl="65px"
                    fontSize="30"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setNameInput(e.target.value);
                    }}
                    value={nameInput}
                    autoFocus
                    ref={searchInputRef}
                  />
                </InputGroup>
              </Flex>
              <Spacer />
              <Flex paddingRight="10px">
                <Image w="40px" h="40px" src="/close.svg" alt="close button" onClick={onClose} />
              </Flex>
            </HStack>
          </ModalHeader>
          <ModalBody overflow="scroll">
            <Box overflow="scroll" mb={10}>
              <SimpleGrid columns={2} spacing={1}>
                {nameInput !== ''
                  ? allUsers
                      .filter((user) => {
                        if (user.id === me.id) {
                          return false;
                        }
                        const regex = new RegExp(nameInput, 'i');
                        return user.name.match(regex);
                      })
                      .map((user, index) => (
                        <Link key={index} href={`/user/${user.name}`}>
                          <RawUserItem user={user} />
                        </Link>
                      ))
                  : allUsers.map((user, index) => {
                      if (user.id === me.id) {
                        return;
                      }
                      return (
                        <Link key={index} href={`/user/${user.name}`}>
                          <RawUserItem user={user} />
                        </Link>
                      );
                    })}
              </SimpleGrid>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default function Sidebar() {
  const { friends, fetchFriends, fetchFriendsStatus, fetchBlockedUsers } = userStore();
  const { socket: chatSocket, makeSocket: makeChatSocket, dmMsgList, addDmMsg } = chatStore();
  const { socket: gameSocket, makeSocket: makeGameSocket } = gameStore();

  useEffect(() => {
    if (chatSocket === undefined) {
      makeChatSocket();
    }
  }, [chatSocket?.connected]);

  useEffect(() => {
    if (gameSocket === undefined) {
      makeGameSocket();
    }
  }, [gameSocket?.connected]);

  useEffect(() => {
    fetchFriends().catch(console.log);
    fetchBlockedUsers().catch(console.log);
  }, []);

  // 1초마다 친구 UserStatus만 갱신
  useEffect(() => {
    const id = setInterval(() => fetchFriendsStatus().catch(console.log), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (chatSocket === undefined || !chatSocket.connected) {
      return;
    }
    chatSocket.on('join', console.log);
    // chatSocket.on('directMessage', ({ user, targetUser, message }) => {
    //   addDmMsg(user.username, targetUser.user.username, message);
    // });

    return () => {
      chatSocket.off('join');
      // chatSocket.off('directMessage');
    };
  }, [chatSocket?.connected]);

  // FIXME: dm 간헐적으로 오지 않는 오류 해결하기 위해 찍은 로그. 고쳐지면 삭제해도 됩니다.
  useEffect(() => {
    console.log(dmMsgList);
  }, [dmMsgList]);

  return (
    <>
      <VStack
        w="full"
        h="95%"
        padding={5}
        backgroundColor="white"
        borderRadius="20px"
        mt="30px"
        marginBottom="100"
      >
        <Flex w="full">
          <Text ml="15px" fontSize={30}>
            FRIENDS
          </Text>
          <Spacer />
          <FindUserModal />
        </Flex>
        <VStack w="full" overflow="scroll">
          {friends.map((friend, index) => (
            <UserItem key={index} user={friend} msgNum={0} />
          ))}
        </VStack>
      </VStack>
      <InvitingModal />
      <InvitedModal />
    </>
  );
}
