import MatchInfo from '@/components/MatchInfo';
import { MatchInfoProps } from '@/interfaces/MatchInfoProps';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import MainLayout from '@/layouts/MainLayout';
import { gameStore } from '@/stores/gameStore';
import { convertRawUserToUser, RawUserProps } from '@/utils/convertRawUserToUser';
import { Box, Link, SimpleGrid } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';

export default function WatchPage() {
  const [matchInfoList, setMatchInfoList] = useState<MatchInfoProps[]>([]);
  const { gameSocket, makeSocket } = gameStore();
  const router = useRouter();

  function watchGameRoom(name: string | undefined) {
    if (name === undefined) {
      console.log('name is undefined');
      return;
    }
    if (gameSocket === undefined) {
      console.log('socket is undefined');
      return;
    }
    gameSocket.emit('joinGameRoom', { gameRoomName: name }, ({ error }: any) => {
      alert(error);
      return;
    });
    gameSocket.once('joinGameRoom', (res) => {
      console.log(res);
      router.push(`/watch/${name}`);
    });
  }

  function refreshGameRoomList() {
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
          return { me: p1, opp: p2, roomName: room.gameRoomName };
        })
      );
      setMatchInfoList(newMatchInfoList);
    });
  }

  useEffect(() => {
    if (gameSocket === undefined) {
      makeSocket();
    }
    refreshGameRoomList();
  }, [gameSocket?.connected]);

  useEffect(() => {
    const id = setInterval(() => {
      console.log('refreshed');
      refreshGameRoomList();
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <Head>
        <title>?????? | LastPong</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box maxH="100%" overflowY="scroll">
        <SimpleGrid m={20} columns={2} spacing={5}>
          {matchInfoList.map((matchInfo, idx) => (
            <Box
              key={idx}
              _hover={{
                color: 'teal.500',
                borderColor: 'teal.500',
              }}
              _active={{
                color: 'blue.500',
                borderColor: 'blue.500',
              }}
              borderRadius={20}
              border={'2px'}
              onClick={() => watchGameRoom(matchInfo.roomName)}
            >
              <MatchInfo me={matchInfo.me} opp={matchInfo.opp} />
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </>
  );
}

WatchPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
