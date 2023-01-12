import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ReactElement, ReactNode, useState, useEffect } from 'react';
import theme from './theme';
import '/styles/global.css';
import {
  Center,
  ChakraProvider,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack,
  Text,
  Box,
  HStack,
} from '@chakra-ui/react';
import { CustomButton } from '@/components/CustomButton';
import CustomAvatar from '@/components/CustomAvatar';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import { useRouter } from 'next/router';
import { chatStore } from '@/stores/chatStore';
import { gameStore } from '@/stores/gameStore';
import { fetchUserById } from '@/utils/fetchUserById';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function InviteModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { socket, isInvited, InviteData, setIsInvited } = chatStore();
  const {
    socket: gameSocket,
    room,
    isSetting,
    isCreated,
    setIsCreated,
    makeSocket,
    disconnectSocket,
  } = gameStore();

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
    if (socket === undefined) {
      console.log('inviteGameRoomInfo : socket undefind');
      return;
    }
    if (socket.connected === false) {
      console.log('inviteGameRoomInfo : socket connected FALSE');
      return;
    }
    if (gameSocket === undefined) {
      console.log('joinGameRoom : gameSocket undefind');
      return;
    }
    if (gameSocket.connected === false) {
      console.log('joinGameRoom : gameSocket connected FALSE');
      return;
    }
    if (isCreated === 0) {
      console.log('inviteGameRoomInfo: Create Message Not Yet..');
      return;
    }

    console.log('EMIT CHAT : inviteGameRoomInfo');
    console.log(room.gameRoomName);
    sleep(300).then(() => {
      if (InviteData === undefined) return;
      socket.emit('inviteGameRoomInfo', {
        randomInviteRoomName: InviteData.randomInviteRoomName,
        inviteGameRoomName: room.gameRoomName,
        hostId: InviteData?.hostId,
        targetId: InviteData?.targetId,
      });
    });
    sleep(300).then(() => {
      console.log('EMIT GAME : joinGameRoom');
      gameSocket.emit('joinGameRoom', {
        gameRoomName: room.gameRoomName,
      });
      setIsCreated(0);
    });
  }, [isCreated]);

  return (
    <Modal
      // closeOnEsc={false}
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent bg="main" color="white">
        <Center>
          <VStack>
            <ModalHeader>INVITE</ModalHeader>
            <ModalBody textAlign={'center'} fontSize="50">
              INVITING USER
            </ModalBody>
            <ModalFooter>
              {/* <CustomButton size="md" onClick={handleMatchCancelBtnClicked}>
                  CANCEL
                </CustomButton> */}
            </ModalFooter>
          </VStack>
        </Center>
      </ModalContent>
    </Modal>
  );
}

function InvitedModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isInvited, InviteData, socket, setIsInvited } = chatStore();

  const [invitingDummyUser, setInvitingDummyUser] = useState<UserProps>({
    id: 1,
    name: 'yopark',
    imgUrl: '',
    status: UserStatus.INGAME,
    rating: 1028,
  });

  useEffect(() => {
    if (InviteData === undefined) return;
    fetchUserById(InviteData.hostId).then((data) => {
      setInvitingDummyUser(data);
    });
  }, [InviteData]);

  useEffect(() => {
    if (isInvited === 1) {
      console.log(InviteData);
      onOpen();
    } else return;
  }, [isInvited]);

  function handleMatchBtnClicked() {
    if (socket === undefined) {
      console.log('responseInvite : socket undefind');
      return;
    }
    if (socket.connected === false) {
      console.log('responseInvite : socket connected FALSE');
      return;
    }
    if (isInvited !== 1 || InviteData === undefined) return;
    sleep(300).then(() => {
      console.log('EMIT CHAT : responseInvite TRUE');
      socket.emit('responseInvite', {
        response: true,
        randomInviteRoomName: InviteData.randomInviteRoomName,
        hostId: InviteData.hostId,
        targetId: InviteData.targetId,
      });
    });
    onClose();
  }

  function handleMatchCancelBtnClicked() {
    if (socket === undefined) {
      console.log('responseInvite : socket undefind');
      return;
    }
    if (socket.connected === false) {
      console.log('responseInvite : socket connected FALSE');
      return;
    }
    if (isInvited !== 1 || InviteData === undefined) return;
    console.log('EMIT CHAT : responseInvite FALSE');
    sleep(300).then(() => {
      socket.emit('responseInvite', {
        response: false,
        randomInviteRoomName: InviteData.randomInviteRoomName,
        hostId: InviteData.hostId,
        targetId: InviteData.targetId,
      });
      setIsInvited(0);
      onClose();
    });
  }

  return (
    <Modal
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay backdropFilter="blur(10px) " />
      <ModalContent bg="win" color="white" borderRadius={30}>
        <Center>
          <VStack>
            <ModalBody>
              <VStack>
                <Flex w="100%" justifyContent="space-around" alignItems="center" bg="Win">
                  <Box mr={5}>
                    <CustomAvatar
                      url={invitingDummyUser.imgUrl}
                      size="xl"
                      status={invitingDummyUser.status}
                    />
                  </Box>
                  <VStack>
                    <Text fontSize="4xl">{invitingDummyUser.name.toUpperCase()}</Text>
                    <HStack>
                      <Text>RATING</Text>
                      <Text color={'opponent'}>{invitingDummyUser.rating}</Text>
                    </HStack>
                  </VStack>
                </Flex>
                <Text fontSize="300%">INVITED YOU</Text>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <VStack mb={'7'}>
                {/* TODO:onclick 핸들러로 매치 잡는 기능 */}
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
        </Center>
      </ModalContent>
    </Modal>
  );
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const { socket: gameSocket, makeSocket } = gameStore();

  useEffect(() => {
    sleep(300).then(() => {
      if (gameSocket === undefined || gameSocket.connected === false) {
        console.log('Socket Making!');
        makeSocket();
      }
    });
  }, [gameSocket]);

  // TODO: beforeunload일 때 처리 어떻게 하지..?
  const router = useRouter();

  return (
    <ChakraProvider theme={theme}>
      {getLayout(<Component {...pageProps} key={router.asPath} />)}
      <InviteModal />
      <InvitedModal />
    </ChakraProvider>
  );
}
