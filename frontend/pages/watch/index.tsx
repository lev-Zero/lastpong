import MatchInfo from '@/components/MatchInfo';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import MainLayout from '@/layouts/MainLayout';
import { Box, SimpleGrid } from '@chakra-ui/react';
import Head from 'next/head';
import { ReactElement } from 'react';

export default function WatchPage() {
  const me: UserProps = {
    name: 'yopark',
    imgUrl: 'https://bit.ly/dan-abramov',
    status: UserStatus.inGame,
    rating: 1028,
    winCnt: 3,
    loseCnt: 2,
    useOtp: false,
  };
  const opp: UserProps = {
    name: 'pongmaster',
    imgUrl: 'https://bit.ly/dan-abramov',
    status: UserStatus.inGame,
    rating: 2510,
    winCnt: 300,
    loseCnt: 200,
    useOtp: true,
  };

  return (
    <>
      <Head>
        <title>관전 | LastPong</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box maxH="100%" overflowY="scroll">
        <SimpleGrid m={20} columns={2} spacing={5}>
          <MatchInfo me={me} opp={opp} />
          <MatchInfo me={me} opp={opp} />
          <MatchInfo me={me} opp={opp} />
          <MatchInfo me={me} opp={opp} />
          <MatchInfo me={me} opp={opp} />
          <MatchInfo me={me} opp={opp} />
          <MatchInfo me={me} opp={opp} />
          <MatchInfo me={me} opp={opp} />
          <MatchInfo me={me} opp={opp} />
          <MatchInfo me={me} opp={opp} />
          <MatchInfo me={me} opp={opp} />
          <MatchInfo me={me} opp={opp} />
        </SimpleGrid>
      </Box>
    </>
  );
}

WatchPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
