import React from 'react';
import { CustomButton } from '@/components/CustomButton';
import MatchInfo from '@/components/MatchInfo';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import { SwitchProps } from '@chakra-ui/react';
import MainLayout from '@/layouts/MainLayout';
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  SimpleGrid,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useState } from 'react';
import { ReactElement } from 'react';
import { Socket } from 'socket.io-client';
import { gameStore } from '@/stores/gameStore';
import { useRouter } from 'next/router';

export default function GameOptionsPage() {
  const router = useRouter();
  const [valueOpt1, setValueOpt1] = React.useState(false);
  const [valueOpt2, setValueOpt2] = React.useState(false);
  const { socket, gameRoomName } = gameStore();

  const me: UserProps = {
    id: 42,
    name: 'yopark',
    imgUrl: 'https://bit.ly/dan-abramov',
    status: UserStatus.INGAME,
    rating: 1028,
  };
  const opp: UserProps = {
    id: 42,
    name: 'pongmaster',
    imgUrl: 'https://bit.ly/dan-abramov',
    status: UserStatus.INGAME,
    rating: 2510,
  };
  const isMyTurn: boolean = true;

  function OnclickReady() {
    // if (socket === undefined) {
    //   console.log('socket is undefined');
    //   alert('Sockect is not working Critical ERROR!!');
    //   disconnectSocket();
    //   router.push('/');
    // } else {
    console.log(`${valueOpt1} OPTION1`);
    console.log(`${valueOpt2} OPTION2`);
    console.log(socket);
    console.log(gameRoomName);
    // socket.emit('readyGame');
    // }
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
          <MatchInfo me={me} opp={opp} />
        </Box>
        <Box my={5}>
          <Text fontSize="2xl">CHOOSE A GAME OPTIONS</Text>
        </Box>
        <Box bg="white" p={20} borderRadius="42">
          <FormControl display="flex" alignItems="center" mb={10}>
            <FormLabel htmlFor="dark-mode" mb="0">
              <Text fontSize="xl">DARK MODE?</Text>
            </FormLabel>
            <Switch size="lg" id="dark-mode" onChange={(e) => setValueOpt1(!valueOpt1)} />
          </FormControl>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="fast-mode" mb="0">
              <Text fontSize="xl">FAST MODE?</Text>
            </FormLabel>
            <Switch size="lg" id="dark-mode" onChange={(e) => setValueOpt2(!valueOpt2)} />
          </FormControl>
        </Box>
        <Box py={10}>
          <CustomButton size="lg" onClick={OnclickReady}>
            READY
          </CustomButton>
        </Box>
      </Flex>
    </>
  );
}

GameOptionsPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
