import MatchInfo from '@/components/MatchInfo';
import { MatchInfoProps } from '@/interfaces/MatchInfoProps';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import MainLayout from '@/layouts/MainLayout';
import { gameStore } from '@/stores/gameStore';
import { convertRawUserToUser, RawUserProps } from '@/utils/convertRawUserToUser';
import { Box, SimpleGrid } from '@chakra-ui/react';
import Head from 'next/head';
import { ReactElement, useEffect, useState } from 'react';

export default function WatchPage() {
  const [matchInfoList, setMatchInfoList] = useState<MatchInfoProps[]>([]);
  const { gameSocket, makeSocket } = gameStore();

  useEffect(() => {
    if (gameSocket === undefined) {
      makeSocket();
    }
  }, []);

  useEffect(() => {
    if (gameSocket === undefined || !gameSocket.connected) {
      console.log('socket is not ready');
      return;
    }
    gameSocket.emit('findGameRooms');
    gameSocket.once('findGameRooms', async ({ gameRoom }: any) => {
      const newMatchInfoList: MatchInfoProps[] = await Promise.all(
        gameRoom.map(async (room: any) => {
          if (room.players.length !== 2) {
            console.log('players are not 2 people');
            return;
          }
          const rawP1: RawUserProps = room.players[0].user;
          const rawP2: RawUserProps = room.players[1].user;
          const p1: UserProps = await convertRawUserToUser(rawP1);
          const p2: UserProps = await convertRawUserToUser(rawP2);
          return { me: p1, opp: p2 };
        })
      );
      setMatchInfoList(newMatchInfoList);
    });
  }, [gameSocket?.connected]);

  return (
    <>
      <Head>
        <title>관전 | LastPong</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box maxH="100%" overflowY="scroll">
        <SimpleGrid m={20} columns={2} spacing={5}>
          {matchInfoList.map((matchInfo, idx) => (
            <MatchInfo key={idx} me={matchInfo.me} opp={matchInfo.opp} />
          ))}
        </SimpleGrid>
      </Box>
    </>
  );
}

WatchPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
