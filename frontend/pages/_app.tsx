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
  Spinner,
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

function InvitingModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { socket: chatSocket, isInvited, inviteData } = chatStore();
  const { socket: gameSocket, room, isCreated, setIsCreated } = gameStore();

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

  const [invitingUser, setInvitingUser] = useState<UserProps>();

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
                <Text fontSize="6xl">INVITED YOU</Text>
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

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  // const { socket: gameSocket, makeSocket } = gameStore();

  // FIXME: App은 로그인 안 했을 때의 페이지도 포함인데, 여기 넣는게 맞나?
  // useEffect(() => {
  //   sleep(300).then(() => {
  //     if (gameSocket === undefined || gameSocket.connected === false) {
  //       console.log('Socket Making!');
  //       makeSocket();
  //     }
  //   });
  // }, [gameSocket]);

  // TODO: beforeunload일 때 처리 어떻게 하지..?
  const router = useRouter();

  return (
    <ChakraProvider theme={theme}>
      {getLayout(<Component {...pageProps} key={router.asPath} />)}
      <InvitingModal />
      <InvitedModal />
    </ChakraProvider>
  );
}
