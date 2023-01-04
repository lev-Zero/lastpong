import MainLayout from '@/layouts/MainLayout';
import Head from 'next/head';
import { ReactElement, useEffect, useState } from 'react';
import {
  Button,
  Center,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { CustomButton } from '@/components/CustomButton';
import { io, Socket } from 'socket.io-client';
import { gameStore } from '@/stores/gameStore';

export default function HomePage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [timeSpent, setTimeSpent] = useState<number>(1);
  const { socket, setSocket, makeSocket, disconnectSocket } = gameStore();
  const [flag, setFlag] = useState<number>(0);

  // async function cancelQueue() {
  //   console.log('Disconnect Queue');
  //   disconnectSocket();
  //   setFlag(0);
  // }

  // async function searchPlayer() {
  //   await makeSocket();
  //   if (socket === undefined) {
  //     console.log('socket is undefined');
  //     return;
  //   }
  //   socket.on('randomGameMatch', (res) => {
  //     console.log(res);
  //   });
  //   socket.emit('randomGameMatch');
  // }

  useEffect(() => {
    const interval = setInterval(() => setTimeSpent((cur) => cur + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // useEffect(() => {
  //   if (isOpen) {
  //     setTimeSpent(1);
  //     searchPlayer();
  //     console.log('ON');
  //   } else {
  //     cancelQueue();
  //     console.log('OFF');
  //   }
  // }, [isOpen]);

  function handleMatchBtnClicked() {
    setTimeSpent(1);
    makeSocket();
    onOpen();
  }

  function handleMatchCancelBtnClicked() {
    disconnectSocket();
    console.log('socket is disconnected');
    onClose();
  }

  useEffect(() => {
    if (socket === undefined) {
      return;
    }
    socket.on('randomGameMatch', (res) => {
      console.log(res);
    });
    socket.emit('randomGameMatch');
    console.log('socket is connected');
  }, [socket]);

  return (
    <>
      <Head>
        <title>LastPong</title>
        <meta name="description" content="ft_transcendence project in 42 Seoul" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex height={'100%'} flexDir={'column'} alignItems="center" justifyContent={'center'}>
        <Image src="/HowToPlay.png" height="90%" alt="How To Play LastPong" />
        <CustomButton
          size="2xl"
          onClick={handleMatchBtnClicked}
          btnStyle={{ position: 'absolute', bottom: '13%', right: '52%' }}
        >
          MATCH
        </CustomButton>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
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
