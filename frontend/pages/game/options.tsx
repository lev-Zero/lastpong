import React from 'react';
import { CustomButton } from '@/components/CustomButton';
import MatchInfo from '@/components/MatchInfo';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
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
  Spinner,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { ReactElement } from 'react';
import { gameStore } from '@/stores/gameStore';
import { userStore } from '@/stores/userStore';
import { useRouter } from 'next/router';
import { convertRawUserToUser, RawUserProps } from '@/utils/convertRawUserToUser';
import { GameUserProps } from '@/interfaces/GameUserProps';

export default function GameOptionsPage() {
  const router = useRouter();
  const [valueOpt1, setValueOpt1] = React.useState(false);
  const [valueOpt2, setValueOpt2] = React.useState(false);
  const [valueInt1, setValueInt1] = React.useState(0);
  const [valueInt2, setValueInt2] = React.useState(0);

  const [isMyTurn, setMyTurn] = React.useState(false);
  const { me } = userStore();

  const [leftUser, setLeftUser] = useState<UserProps>();
  const [rightUser, setRightUser] = useState<UserProps>();
  const [meUser, setMeUser] = useState<GameUserProps>(); // FIXME: 이것도 UserProps로 바꾸고 싶었으나, 의존적으로 활용하는 곳이 너무 많아 아직 리팩토링하지 못했다. 사실 GameUserProps로 저장할 게 아니라 UserProps로 저장해야 한다.

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [timeSpent, setTimeSpent] = useState<number>(1);
  const { socket, room, isReady, GameMeProps, setGameMeProps } = gameStore();

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
    async function fetchTwoUsers() {
      if (room === undefined) {
        console.log('room is undefined');
        return;
      }
      if (room.players.length !== 2) {
        console.log('players are not 2 people');
        return;
      }
      const rawLeftUser: RawUserProps = room.players[0].user;
      const rawRightUser: RawUserProps = room.players[1].user;
      const leftUser: UserProps = await convertRawUserToUser(rawLeftUser);
      const rightUser: UserProps = await convertRawUserToUser(rawRightUser);
      setLeftUser(leftUser);
      setRightUser(rightUser);
      if (me.id === leftUser.id) { // FIXME: meUser를 GameUserProps에 맞추려고 하다보니 생긴 코드입니다... UserProps로 통일해야 합니다.
        setMeUser({
          id: rawLeftUser.id,
          rating: rawLeftUser.rating,
          username: rawLeftUser.username,
          status: rawLeftUser.status,
          username42: rawLeftUser.username42 ?? '',
        });
      } else {
        setMeUser({
          id: rawRightUser.id,
          rating: rawRightUser.rating,
          username: rawRightUser.username,
          status: rawRightUser.status,
          username42: rawRightUser.username42 ?? '',
        });
      }
    }
    fetchTwoUsers();
  }, [room?.players]);

  useEffect(() => {
    if (meUser === undefined) {
      return;
    }
    setGameMeProps(meUser);
  }, [meUser]);

  useEffect(() => {
    if (GameMeProps === undefined || leftUser === undefined || rightUser === undefined) {
      return;
    }
    if (GameMeProps.username === leftUser.name) {
      if (GameMeProps.rating <= rightUser.rating) setMyTurn(true);
      else setMyTurn(false);
    } else if (GameMeProps.username === rightUser.name) {
      if (GameMeProps.rating <= rightUser.rating) setMyTurn(true);
      else setMyTurn(false);
    }
  }, [GameMeProps, leftUser, rightUser]);

  useEffect(() => {
    if (isReady === 0) return;
    else {
      if (room.gameRoomName !== '') router.push('/game/' + room.gameRoomName);
    }
  }, [isReady]);

  async function handleMatchBtnClicked() {
    setTimeSpent(1);
    if (socket === undefined) {
      console.log('socket is undefined');
      alert('Sockect is not working Critical ERROR!!');
      router.push('/');
    } else {
      socket.emit('readyGame', {
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
      {leftUser === undefined || rightUser === undefined ? (
        <Spinner />
      ) : (
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
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
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
      )}
    </>
  );
}

GameOptionsPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
