import MainLayout from '@/layouts/MainLayout';
import Head from 'next/head';
import { ReactElement, useEffect, useState } from 'react';
import {
  Center,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { CustomButton } from '@/components/CustomButton';
import { gameStore } from '@/stores/gameStore';
import { useRouter } from 'next/router';

export default function HomePage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [timeSpent, setTimeSpent] = useState<number>(1);
  const { socket: gameSocket, room, isSetting, setIsSetting, disconnectSocket } = gameStore();
  const router = useRouter();
  const [intervalId, setIntervalId] = useState<NodeJS.Timer>();

  function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function handleMatchBtnClicked() {
    if (gameSocket === undefined || gameSocket.connected === false) {
      console.log('gameSocket is not connected');
      return;
    }
    onOpen();
    setIntervalId(setInterval(() => setTimeSpent((cur) => cur + 1), 1000));

    sleep(2000).then(() => gameSocket.emit('randomGameMatch'));
  }

  function handleMatchCancelBtnClicked() {
    if (gameSocket === undefined || gameSocket.connected === false) {
      console.log('gameSocket is not connected');
      onClose();
      return;
    }
    if (room.gameRoomName === '') {
      gameSocket.emit('removeSocketInQueue');
      gameSocket.removeAllListeners();
      disconnectSocket();
      setIsSetting(0);
      console.log('socket is disconnected');
    }
    if (intervalId !== undefined) {
      clearInterval(intervalId);
      setIntervalId(undefined);
      setTimeSpent(1);
    }
    onClose();
  }

  useEffect(() => {
    if (gameSocket === undefined || isSetting === 0) {
      return;
    }
    console.log(`${room.gameRoomName} 방으로 게임 매칭되었습니다.`);
    router.push('/game/options');
  }, [isSetting]);

  return (
    <>
      <Head>
        <title>LastPong</title>
        <meta name="description" content="ft_transcendence project in 42 Seoul" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <VStack h="95%" mt="30px" mr="30px">
        <Image
          src="/how-to-play.png"
          height="full"
          alt="How To Play LastPong"
          pointerEvents="none"
          borderRadius="20px"
        />
        <CustomButton
          size="2xl"
          onClick={handleMatchBtnClicked}
          btnStyle={{ position: 'absolute', bottom: '10%', right: '52%' }}
        >
          MATCH
        </CustomButton>
      </VStack>
      <Modal
        closeOnEsc={false}
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent bg="main" color="white">
          <Center>
            <VStack>
              <ModalHeader>LOOKING FOR AN OPPONENT...</ModalHeader>
              <ModalBody fontSize="6xl">{timeSpent}</ModalBody>
              <ModalFooter>
                <CustomButton size="md" onClick={handleMatchCancelBtnClicked}>
                  CANCEL
                </CustomButton>
              </ModalFooter>
            </VStack>
          </Center>
        </ModalContent>
      </Modal>
    </>
  );
}

HomePage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
