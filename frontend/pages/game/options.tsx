import { CustomButton } from '@/components/CustomButton';
import MatchInfo from '@/components/MatchInfo';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
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
import { ReactElement } from 'react';

export default function GameOptionsPage() {
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
            <Switch size="lg" id="dark-mode" />
          </FormControl>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="fast-mode" mb="0">
              <Text fontSize="xl">FAST MODE?</Text>
            </FormLabel>
            <Switch size="lg" id="dark-mode" />
          </FormControl>
        </Box>
        <Box py={10}>
          <CustomButton size="lg" onClick={() => {}}>
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
