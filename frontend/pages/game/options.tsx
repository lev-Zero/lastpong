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
import { sleep } from '@/utils/sleep';
import { fetchUserById } from '@/utils/fetchUserById';

export default function GameOptionsPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isFastMode, setIsFastMode] = useState<boolean>(false);
  const [isMyTurn, setMyTurn] = useState(false);
  const [timeSpent, setTimeSpent] = useState<number>(1);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer>();

  const { me } = userStore();
  const [leftUser, setLeftUser] = useState<UserProps>();
  const [rightUser, setRightUser] = useState<UserProps>();
  const [meUser, setMeUser] = useState<GameUserProps>(); // FIXME: 이것도 UserProps로 바꾸고 싶었으나, 의존적으로 활용하는 곳이 너무 많아 아직 리팩토링하지 못했다. 사실 GameUserProps로 저장할 게 아니라 UserProps로 저장해야 한다.
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { socket: gameSocket, room, setRoom, gameMeProps, setGameMeProps } = gameStore();
  // const [calledPushRoot, setCalledPushRoot] = useState<boolean>(false); // React.StrictMode 두번 렌더링으로 인한 router.push 중복 발생 문제 해결방법
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isOppLeft, setIsOppLeft] = useState<boolean>(false);

  function toggleDarkMode() {
    setIsDarkMode((pre) => !pre);
  }

  function toggleFastMode() {
    setIsFastMode((pre) => !pre);
  }

  // // 연결 유실 시 / 으로 라우팅
  // useEffect(() => {
  //   if (gameSocket === undefined) {
  //     if (!calledPushRoot) {
  //       router.push('/');
  //     }
  //     setCalledPushRoot(true);
  //   }
  // }, [gameSocket]);

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
      const leftUser: UserProps = await fetchUserById(rawLeftUser.id);
      const rightUser: UserProps = await fetchUserById(rawRightUser.id);
      setLeftUser(leftUser);
      setRightUser(rightUser);
      if (me.id === leftUser.id) {
        // FIXME: meUser를 GameUserProps에 맞추려고 하다보니 생긴 코드입니다... UserProps로 통일해야 합니다.
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
  }, [room]);

  useEffect(() => {
    if (meUser === undefined) {
      return;
    }
    setGameMeProps(meUser);
  }, [meUser]);

  useEffect(() => {
    if (gameMeProps === undefined || leftUser === undefined || rightUser === undefined) {
      return;
    }
    setMyTurn(
      gameMeProps.username === leftUser.name
        ? gameMeProps.rating <= rightUser.rating
        : gameMeProps.rating <= leftUser.rating
    );
  }, [gameMeProps, leftUser, rightUser]);

  function handleReadyBtnClicked() {
    if (gameSocket === undefined || gameSocket.connected === false) {
      console.log('gameSocket is not connected');
      return;
    }
    onOpen();
    setIntervalId(setInterval(() => setTimeSpent((cur) => cur + 1), 1000));

    sleep(2000).then(() =>
      gameSocket.emit('readyGame', {
        gameRoomName: room.gameRoomName,
        backgroundColor: Number(isDarkMode),
        mode: Number(isFastMode),
      })
    );
    gameSocket.once('readyGame', (res) => {
      setRoom(res.gameRoom);
      setIsReady(true);
    });
  }

  useEffect(() => {
    if (!isReady) {
      return;
    }
    router.push(`/game/${room.gameRoomName}`);
  }, [isReady]);

  useEffect(() => {
    function handleRouteChangeStart() {
      if (isReady || isOppLeft) {
        return;
      }
      const warningText = 'OPTION 게임에서 나가게 되면 당신은 패배하게 될것입니다!';
      if (window.confirm(warningText)) {
        if (gameSocket === undefined) {
          return;
        }
        gameSocket.emit('exitGameRoom', { gameRoomName: room.gameRoomName });
        return;
      }
      router.events.emit('routeChangeError');
      throw 'routeChange aborted';
    }
    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [isReady, isOppLeft]);

  useEffect(() => {
    if (gameSocket === undefined || !gameSocket.connected) {
      console.log('gameSocket is not ready');
      return;
    }
    gameSocket.on('exitGameRoom', (res) => {
      console.log('exitGameRoom', res.message);
      if ('userId' in res) {
        setIsOppLeft(true);
      }
    });

    return () => {
      gameSocket.off('exitGameRoom');
    };
  }, [gameSocket?.connected]);

  useEffect(() => {
    if (!isOppLeft) {
      return;
    }
    alert('상대가 나갔습니다. 게임을 종료합니다.');
    if (gameSocket === undefined || !gameSocket.connected) {
      console.log('gameSocket is not ready');
      return;
    }
    gameSocket.emit('exitGameRoom', { gameRoomName: room.gameRoomName });
    router.push('/home');
  }, [isOppLeft, gameSocket?.connected]);

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
                <Switch size="lg" onChange={toggleDarkMode} disabled={!isMyTurn} />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="fast-mode" mb="0">
                  <Text fontSize="xl">FAST MODE?</Text>
                </FormLabel>
                <Switch size="lg" onChange={toggleFastMode} disabled={!isMyTurn} />
              </FormControl>
            </Box>
            <Box py={10}>
              <CustomButton size="lg" onClick={handleReadyBtnClicked}>
                READY
              </CustomButton>
            </Box>
          </Flex>
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent bg="main" color="white" p={20} borderRadius={30}>
              <Center>
                <VStack>
                  <ModalHeader>READY FOR THE GAME...</ModalHeader>
                  <ModalBody fontSize="6xl">{timeSpent}</ModalBody>
                  {/* <ModalFooter>
                    <CustomButton size="md" onClick={handleMatchCancelBtnClicked}>
                  CANCEL
                </CustomButton>
                  </ModalFooter> */}
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
