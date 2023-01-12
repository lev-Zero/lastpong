import React, { useState } from 'react';
import { useEffect } from 'react';
import LayoutWithoutSidebar from '@/layouts/LayoutWithoutSidebar';
import Head from 'next/head';
import { ReactElement } from 'react';
import { gameStore } from '@/stores/gameStore';
import dynamic from 'next/dynamic';
import p5Types from 'p5';

import {
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
  HStack,
} from '@chakra-ui/react';
import { CustomButton } from '@/components/CustomButton';
import { useRouter } from 'next/router';
import { convertRawUserToUser, RawUserProps } from '@/utils/convertRawUserToUser';
import { UserProps } from '@/interfaces/UserProps';

const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
  ssr: false,
});

export default function GamePage() {
  const {
    socket: gameSocket,
    room,
    gameBall,
    gameScore,
    leftTouchBar,
    rightTouchBar,
    isFinished,
    gameMeProps,
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
    if (gameMeProps !== undefined) {
      if (gameMeProps.id === leftUser.id) {
        if (gameScore[0] > gameScore[1]) setWinLose(true);
        else setWinLose(false);
      } else {
        if (gameScore[1] > gameScore[0]) setWinLose(true);
        else setWinLose(false);
      }
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

  function goToHome() {
    router.push('/home');
  }

  function draw(p5: p5Types) {
    function drawBackground() {
      if (room.facts.gameOption.backgroundColor === 0) {
        p5.background('white');
        p5.fill('black');
        p5.rect(0, 0, room.facts.display.width, room.facts.display.height);
        p5.fill('white');
        p5.rect(2, 2, room.facts.display.width - 4, room.facts.display.height - 4);
        p5.fill('black');
        p5.circle(room.facts.display.width / 2, room.facts.display.height / 2, 300);
        p5.fill('white');
        p5.circle(room.facts.display.width / 2, room.facts.display.height / 2, 298);
        p5.fill('black');
        p5.strokeWeight(3);
        p5.line(
          room.facts.display.width / 2,
          0,
          room.facts.display.width / 2,
          room.facts.display.height
        );
        p5.strokeWeight(2);
      } else {
        p5.background('black');
        p5.fill('white');
        p5.rect(0, 0, room.facts.display.width, room.facts.display.height);
        p5.fill('black');
        p5.rect(7, 7, room.facts.display.width - 14, room.facts.display.height - 14);
        p5.fill('white');
        p5.circle(room.facts.display.width / 2, room.facts.display.height / 2, 300);
        p5.fill('black');
        p5.circle(room.facts.display.width / 2, room.facts.display.height / 2, 290);
        p5.fill('white');
        p5.strokeWeight(8);
        p5.stroke(255, 255, 255);
        p5.line(
          room.facts.display.width / 2,
          0,
          room.facts.display.width / 2,
          room.facts.display.height
        );
        p5.strokeWeight(2);
      }
    }
    function drawScore() {
      if (leftUser === undefined || rightUser === undefined) {
        return;
      }
      p5.textSize(70);
      p5.textFont('Bungee');
      p5.text(String(gameScore[0]).padStart(2, '0'), room.facts.display.width / 3 + 50, 90);
      p5.text(String(gameScore[1]).padStart(2, '0'), (2 * room.facts.display.width) / 3 - 100, 90);
    }

    function drawLeftUserBar() {
      p5.fill(room.facts.gameOption.backgroundColor === 0 ? 'black' : 'white');
      p5.rect(
        room.facts.touchBar.x,
        leftTouchBar - room.facts.touchBar.height / 2,
        room.facts.touchBar.width,
        room.facts.touchBar.height
      );
    }

    function drawRightUserBar() {
      p5.fill(room.facts.gameOption.backgroundColor === 0 ? 'black' : 'white');
      p5.rect(
        room.facts.display.width - room.facts.touchBar.width - room.facts.touchBar.x,
        rightTouchBar - room.facts.touchBar.height / 2,
        room.facts.touchBar.width,
        room.facts.touchBar.height
      );
    }

    function drawBall() {
      p5.fill(room.facts.gameOption.backgroundColor === 0 ? 'black' : 'white');
      p5.circle(gameBall.x, gameBall.y, room.facts.ball.radius);
    }

    if (gameSocket !== undefined) {
      gameSocket.emit('touchBar', {
        touchBar: p5.mouseY,
        gameRoomName: room.gameRoomName,
      });
    }
    drawBackground();
    drawScore();
    drawLeftUserBar();
    drawRightUserBar();
    drawBall();
  }

  return (
    <>
      <Head>
        <title>게임 | LastPong</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HStack
        width="100vw"
        height="92vh"
        bg={room.facts.gameOption.backgroundColor === 0 ? 'white' : 'black'}
      >
        <VStack>
          <Flex width="full" justifyContent="space-around" mb={8}>
            <Text
              fontFamily="Bungee"
              fontSize="6xl"
              color={room.facts.gameOption.backgroundColor === 0 ? 'black' : 'white'}
            >
              {leftUser ? leftUser.name.toUpperCase() : ''}
            </Text>
            <Text
              fontFamily="Bungee"
              fontSize="6xl"
              color={room.facts.gameOption.backgroundColor === 0 ? 'black' : 'white'}
            >
              {rightUser ? rightUser.name.toUpperCase() : ''}
            </Text>
          </Flex>
          <Sketch setup={setup} draw={draw} />
        </VStack>
      </HStack>

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
                  <Flex w="full" justifyContent="space-around" alignItems="center" bg="transparent">
                    <Text fontSize="6xl">{winLose ? 'WIN' : 'LOSE'}</Text>
                  </Flex>
                  <Text fontSize="4xl">
                    {gameScore[0]} : {gameScore[1]}
                  </Text>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <VStack mb={'7'}>
                  <CustomButton
                    size="lg"
                    onClick={goToHome}
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
    </>
  );
}

GamePage.getLayout = function (page: ReactElement) {
  return <LayoutWithoutSidebar>{page}</LayoutWithoutSidebar>;
};
