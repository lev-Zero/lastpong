import React from 'react';
import { CustomButton } from '@/components/CustomButton';
import MatchInfo from '@/components/MatchInfo';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import { SwitchProps } from '@chakra-ui/react';
import MainLayout from '@/layouts/MainLayout';
import {
  Box,
  Center,
  Flex,
  FormControl,
  FormLabel,
  SimpleGrid,
  Switch,
  Text,
  VStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { ReactElement } from 'react';
import { gameStore } from '@/stores/gameStore';
import { userStore } from '@/stores/userStore';
import { useRouter } from 'next/router';
import { GameUserProps } from '@/interfaces/GameUserProps';

export default function GameOptionsPage() {
  const router = useRouter();
  const [valueOpt1, setValueOpt1] = React.useState(false);
  const [valueOpt2, setValueOpt2] = React.useState(false);
  const [valueInt1, setValueInt1] = React.useState(0);
  const [valueInt2, setValueInt2] = React.useState(0);

  const [isMyTurn, setMyTurn] = React.useState(false);
  const { me } = userStore();

  const [leftUser, setLeftUser] = React.useState<GameUserProps>({
    id: 0,
    rating: 1000,
    status: 0,
    username: 'PLAYER1',
    username42: '',
  });

  const [rightUser, setRightUser] = React.useState<GameUserProps>({
    id: 0,
    rating: 1000,
    status: 0,
    username: 'PLAYER2',
    username42: '',
  });

  const [meUser, setMeUser] = React.useState<GameUserProps>({
    id: 0,
    rating: 1000,
    status: 0,
    username: 'PLAYER_ME',
    username42: '',
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [timeSpent, setTimeSpent] = useState<number>(1);
  const { gameSocket, room, isReady, GameMeProps, setGameMeProps } = gameStore();

  useEffect(() => {
    const id = setInterval(() => setTimeSpent((cur) => cur + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (valueOpt1 === false) {
      setValueInt1(0);
    } else {
      setValueInt1(1);
    }
  }, [valueOpt1]);

  useEffect(() => {
    if (valueOpt2 === false) {
      setValueInt2(0);
    } else {
      setValueInt2(1);
    }
  }, [valueOpt2]);

  useEffect(() => {
    if (room === undefined) return;
    else {
      if (room.players.length === 2) {
        if (me.name === room.players[0].user.username) setMeUser(room.players[0].user);
        if (me.name === room.players[1].user.username) setMeUser(room.players[1].user);
        setLeftUser(room.players[0].user);
        setRightUser(room.players[1].user);
      }
    }
  }, [room]);

  useEffect(() => {
    setGameMeProps(meUser);
  }, [meUser]);

  useEffect(() => {
    if (GameMeProps === undefined) return;
    if (GameMeProps.username === leftUser.username) {
      if (GameMeProps.rating <= rightUser.rating) setMyTurn(true);
      else setMyTurn(false);
    } else if (GameMeProps.username === rightUser.username) {
      if (GameMeProps.rating <= rightUser.rating) setMyTurn(true);
      else setMyTurn(false);
    }
  }, [GameMeProps]);

  useEffect(() => {
    if (isReady === 0) return;
    else {
      if (room.gameRoomName !== '') router.push('/game/' + room.gameRoomName);
    }
  }, [isReady]);

  async function handleMatchBtnClicked() {
    setTimeSpent(1);
    if (gameSocket === undefined) {
      console.log('socket is undefined');
      alert('Sockect is not working Critical ERROR!!');
      router.push('/');
    } else {
      gameSocket.emit('readyGame', {
        gameRoomName: room.gameRoomName,
        backgroundColor: valueInt1,
        mode: valueInt2,
      });
      onOpen();
    }
  }

  // TODO : Form 요청 보내는 로직 추가
  // TODO : READY 했을 때 구역 disabled 되도록 변경
  return (
    <>
      <Head>
        <title>게임 옵션 선택 | LastPong</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex
        w="30%"
        minW="400px"
        h="100%"
        direction="column"
        margin="auto"
        alignItems="center"
        justifyContent="center"
      >
        <Box my={5}>
          <MatchInfo me={leftUser} opp={rightUser} />
        </Box>
        <Box my={5}>
          <Text fontSize="2xl">CHOOSE A GAME OPTIONS</Text>
        </Box>
        <Box bg="white" p={20} borderRadius="42">
          <FormControl display="flex" alignItems="center" mb={10}>
            <FormLabel htmlFor="dark-mode" mb="0">
              <Text fontSize="xl">DARK MODE?</Text>
            </FormLabel>
            <Switch
              size="lg"
              id="dark-mode"
              onChange={(e) => setValueOpt1(!valueOpt1)}
              disabled={!isMyTurn}
            />
          </FormControl>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="fast-mode" mb="0">
              <Text fontSize="xl">FAST MODE?</Text>
            </FormLabel>
            <Switch
              size="lg"
              id="dark-mode"
              onChange={(e) => setValueOpt2(!valueOpt2)}
              disabled={!isMyTurn}
            />
          </FormControl>
        </Box>
        <Box py={10}>
          <CustomButton size="lg" onClick={handleMatchBtnClicked}>
            READY
          </CustomButton>
        </Box>
      </Flex>
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
              <ModalHeader>READY FOR THE GAME...</ModalHeader>
              <ModalBody fontSize="6xl">{timeSpent}</ModalBody>
              <ModalFooter>
                {/* <CustomButton size="md" onClick={handleMatchCancelBtnClicked}>
                  CANCEL
                </CustomButton> */}
              </ModalFooter>
            </VStack>
          </Center>
        </ModalContent>
      </Modal>
    </>
  );
}

GameOptionsPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
