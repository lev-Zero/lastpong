import React, { useState } from 'react';
import { useRef, useEffect } from 'react';
import LayoutWithoutSidebar from '@/layouts/LayoutWithoutSidebar';
import Head from 'next/head';
import { ReactElement } from 'react';
import { gameStore } from '@/stores/gameStore';
import dynamic from 'next/dynamic';
import p5Types from 'p5';
import { GameUserProps } from '@/interfaces/GameUserProps';

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
  useDisclosure,
  VStack,
  Text,
  Box,
  HStack,
  Spacer,
} from '@chakra-ui/react';
import { CustomButton } from '@/components/CustomButton';
import { useRouter } from 'next/router';
import { convertRawUserToUser, RawUserProps } from '@/utils/convertRawUserToUser';
import { UserProps } from '@/interfaces/UserProps';

const styles = {
  MainLayout: {
    width: '100vw',
    height: '92vh',
    alignItems: 'center',
    justifyContent: 'center',
    flexDir: 'row',
  } as React.CSSProperties,

  PlayerLayout: {
    width: '300px',
    height: '800px',
  } as React.CSSProperties,

  PlayerBoxLayout: {
    width: '150px',
    height: '200px',
    marginTop: '200px',
  } as React.CSSProperties,

  GameLayout: {
    width: '100%',
    height: '100%',
  } as React.CSSProperties,

  TextUser: {
    fontSize: '40px',
    margin: '0',
    color: 'black',
  } as React.CSSProperties,

  TextScore: {
    fontSize: '160px',
    margin: '0',
    color: 'black',
  } as React.CSSProperties,
};

const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
  ssr: false,
});

export default function GamePage() {
  const {
    gameSocket,
    room,
    GameBall,
    GameScore,
    leftTouchBar,
    rightTouchBar,
    isFinished,
    GameMeProps,
    setGameScore,
    setIsSetting,
    setIsFinished,
    setIsReady,
    disconnectSocket,
  } = gameStore();
  const [winLose, setWinLose] = useState<boolean>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [leftUser, setLeftUser] = useState<UserProps>();
  const [rightUser, setRightUser] = useState<UserProps>();

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
    }
    fetchTwoUsers();
  }, [room]);

  useEffect(() => {
    const warningText = '게임에서 나가게 되면 당신은 패배하게 될것입니다!';
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (isFinished) return;
      if (gameSocket === undefined) return;
      console.log('EMIT GAME : exitGameRoom CLOSE');
      gameSocket.emit('exitGameRoom', {
        gameRoomName: room.gameRoomName,
      });
      e.preventDefault();
      return (e.returnValue = warningText);
    };
    const handleBrowseAway = () => {
      if (isFinished) return;
      if (gameSocket === undefined) return;
      if (window.confirm(warningText)) {
        console.log('EMIT GAME : exitGameRoom Defferent PAGE');
        gameSocket.emit('exitGameRoom', {
          gameRoomName: room.gameRoomName,
        });
        return;
      }
      router.events.emit('routeChangeError');
      throw 'routeChange aborted.';
    };
    window.addEventListener('beforeunload', handleWindowClose);
    router.events.on('routeChangeStart', handleBrowseAway);
    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      router.events.off('routeChangeStart', handleBrowseAway);
    };
  }, [isFinished]);

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    // use parent to render the canvas in this ref
    // (without that p5 will render the canvas outside of your component)
    p5.createCanvas(room.facts.display.width, room.facts.display.height).parent(canvasParentRef);
  };

  useEffect(() => {
    if (gameSocket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (leftUser === undefined) {
      console.log('left user is undefined');
      return;
    }
    if (isFinished === 0) {
      console.log('SOCKET EMIT START GAME!');
      setGameScore([0, 0]);
      gameSocket.emit('startGame', {
        gameRoomName: room.gameRoomName,
      });
      return;
    }
    if (GameMeProps !== undefined) {
      if (GameMeProps.id === leftUser.id) {
        if (GameScore[0] > GameScore[1]) setWinLose(true);
        else setWinLose(false);
      } else {
        if (GameScore[1] > GameScore[0]) setWinLose(true);
        else setWinLose(false);
      }
      if (GameScore[0] !== 10 && GameScore[1] !== 10) setWinLose(true);
    }
  }, [isFinished, leftUser]);

  useEffect(() => {
    if (isFinished === 0) return;
    else {
      if (gameSocket !== undefined) {
        gameSocket.emit('exitGameRoom', {
          gameRoomName: room.gameRoomName,
        });
      }
      onOpen();
      setIsSetting(0);
      setIsFinished(0);
      setIsReady(0);
      disconnectSocket();
    }
  }, [winLose]);

  function handleFinishBtnClicked() {
    router.push('/home');
  }

  const draw = (p5: p5Types) => {
    if (room.facts.gameOption.backgroundColor === 0) {
      p5.background('white');
      p5.fill('black');
      p5.rect(0, 0, room.facts.display.width, room.facts.display.height);
      p5.fill('white');
      p5.rect(2, 2, room.facts.display.width - 4, room.facts.display.height - 4);
    } else {
      p5.background('black');
      p5.fill('white');
      p5.rect(0, 0, room.facts.display.width, room.facts.display.height);
      p5.fill('black');
      p5.rect(7, 7, room.facts.display.width - 14, room.facts.display.height - 14);
    }
    function draw_score(p5obj: p5Types) {
      if (leftUser === undefined || rightUser === undefined) {
        return;
      }
      // p5obj.fill('red');
      // p5obj.textSize(50);
      // p5obj.textFont('Knewave');
      // p5obj.textAlign(p5obj.CENTER);
      // p5obj.text('VS', room.facts.display.width / 2, 60);

      if (room.facts.gameOption.backgroundColor === 0) {
        p5obj.fill('black');
        p5obj.circle(room.facts.display.width / 2, room.facts.display.height / 2, 300);
        p5obj.fill('white');
        p5obj.circle(room.facts.display.width / 2, room.facts.display.height / 2, 298);
        p5obj.fill('black');
        p5obj.strokeWeight(3);
        p5obj.line(
          room.facts.display.width / 2,
          0,
          room.facts.display.width / 2,
          room.facts.display.height
        );
        p5obj.strokeWeight(2);
      } else {
        p5obj.fill('white');
        p5obj.circle(room.facts.display.width / 2, room.facts.display.height / 2, 300);
        p5obj.fill('black');
        p5obj.circle(room.facts.display.width / 2, room.facts.display.height / 2, 290);
        p5obj.fill('white');
        p5obj.strokeWeight(8);
        p5obj.stroke(255, 255, 255);
        p5obj.line(
          room.facts.display.width / 2,
          0,
          room.facts.display.width / 2,
          room.facts.display.height
        );
        p5obj.strokeWeight(2);
      }

      p5obj.textSize(70);
      p5obj.textAlign(p5obj.LEFT);

      // p5obj.text(leftUser.name.toUpperCase(), 15, 60);
      p5obj.textFont('Bungee');
      p5obj.text(GameScore[0], room.facts.display.width / 3 + 50, 90);

      p5obj.textAlign(p5obj.LEFT);
      //
      p5obj.text(GameScore[1], (2 * room.facts.display.width) / 3 - 100, 90);
    }

    function draw_p1_bar(p5obj: p5Types) {
      if (room.facts.gameOption.backgroundColor === 0) {
        p5obj.fill('black');
      } else {
        p5obj.fill('white');
      }
      p5obj.rect(
        room.facts.touchBar.x,
        leftTouchBar - room.facts.touchBar.height / 2,
        room.facts.touchBar.width,
        room.facts.touchBar.height
      );
    }

    function draw_p2_bar(p5obj: p5Types) {
      if (room.facts.gameOption.backgroundColor === 0) {
        p5obj.fill('black');
      } else {
        p5obj.fill('white');
      }
      p5obj.rect(
        room.facts.display.width - room.facts.touchBar.width - room.facts.touchBar.x,
        rightTouchBar - room.facts.touchBar.height / 2,
        room.facts.touchBar.width,
        room.facts.touchBar.height
      );
    }

    function draw_ball(p5obj: p5Types) {
      if (room.facts.gameOption.backgroundColor === 0) {
        p5obj.fill('black');
      } else {
        p5obj.fill('white');
      }
      p5obj.circle(GameBall.x, GameBall.y, room.facts.ball.radius);
    }

    if (gameSocket !== undefined) {
      gameSocket.emit('touchBar', {
        touchBar: p5.mouseY,
        gameRoomName: room.gameRoomName,
      });
    }
    draw_p1_bar(p5);
    draw_p2_bar(p5);
    draw_score(p5);
    draw_ball(p5);
  };

  return (
    <>
      <Head>
        <title>게임 | LastPong</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* if (room.facts.gameOption.backgroundColor === 0) {
        p5obj.fill('black');
      } else {
        p5obj.fill('white');
      } */}
      <Flex
        style={styles.MainLayout}
        bgColor={room.facts.gameOption.backgroundColor === 0 ? 'white' : 'black'}
      >
        {/* <Box style={styles.GameLayout}> */}
        <VStack>
          <Flex width={'full'} justifyContent="space-around" mb={8}>
            <Text
              fontFamily={'Bungee'}
              fontSize={'6xl'}
              color={room.facts.gameOption.backgroundColor === 0 ? 'black' : 'white'}
            >
              {leftUser?.name.toUpperCase()}
            </Text>
            <Text
              fontFamily={'Bungee'}
              fontSize={'6xl'}
              color={room.facts.gameOption.backgroundColor === 0 ? 'black' : 'white'}
            >
              {rightUser?.name.toUpperCase()}
            </Text>
          </Flex>
          <Sketch setup={setup} draw={draw} />
          {/* </Box> */}
        </VStack>
      </Flex>

      <Modal
        closeOnEsc={false}
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg={winLose ? 'win' : 'lose'} color="white" borderRadius={30}>
          <Center>
            <VStack>
              <ModalHeader></ModalHeader>
              <ModalBody>
                <VStack>
                  <Flex w="100%" justifyContent="space-around" alignItems="center" bg="transparent">
                    <Text fontSize="400%">{winLose ? 'WIN' : 'LOSE'}</Text>
                  </Flex>
                  <Text fontSize="200%">
                    {GameScore[0]} : {GameScore[1]}
                  </Text>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <VStack mb={'7'}>
                  <CustomButton
                    size="lg"
                    onClick={handleFinishBtnClicked}
                    btnStyle={{
                      background: 'transparent',
                    }}
                  >
                    HOME
                  </CustomButton>
                </VStack>
              </ModalFooter>
            </VStack>
          </Center>
        </ModalContent>
      </Modal>
      {/* TODO: 버튼이 아니라 경기 결과에 따라서 winLose 상태 변경 로직이 필요 */}
      {/* <Button ml={'10%'} onClick={onOpen}>
        GAME SET
      </Button>
      <Button
        ml={'20%'}
        onClick={() => {
          setWinLose(true);
        }}
      >
        WIN
      </Button>
      <Button
        ml={'30%'}
        onClick={() => {
          setWinLose(false);
        }}
      >
        LOSE
      </Button> */}
    </>
  );
}

GamePage.getLayout = function (page: ReactElement) {
  return <LayoutWithoutSidebar>{page}</LayoutWithoutSidebar>;
};
