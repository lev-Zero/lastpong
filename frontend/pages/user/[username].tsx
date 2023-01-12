import CustomAvatar from '@/components/CustomAvatar';
import { CustomButton } from '@/components/CustomButton';
import MatchHistory from '@/components/MatchHistory';
import WinLoseSum from '@/components/WinLoseSum';
import { MatchHistoryProps } from '@/interfaces/MatchProps';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import MainLayout from '@/layouts/MainLayout';
import { userStore } from '@/stores/userStore';
import { convertRawUserToUser } from '@/utils/convertRawUserToUser';
import { customFetch } from '@/utils/customFetch';
import { Box, Center, Divider, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { match } from 'assert';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';

interface WinLoseProps {
  winCnt: number;
  loseCnt: number;
}
export default function UserProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>();
  const [user, setUser] = useState<UserProps>();
  const { friends, addFriend, deleteFriend, blockedUsers, addBlock, deleteBlock } = userStore();
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryProps[]>([]);
  const [winLose, setWinLose] = useState<WinLoseProps>({
    winCnt: 0,
    loseCnt: 0,
  });
  const { me } = userStore();
  useEffect(() => {
    if (user === undefined) {
      return;
    }
    setIsFriend(friends.some(({ name }) => name === user.name));
  }, [friends, user]);

  useEffect(() => {
    if (user === undefined) {
      return;
    }
    setIsBlocked(blockedUsers.some(({ name }) => name === user.name));
  }, [blockedUsers, user]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    setUsername(router.query.username as string);
  }, [router.isReady]);

  useEffect(() => {
    async function setUserInfo() {
      try {
        const rawUser = await customFetch('GET', `/user/name/${username}`);
        setUser(await convertRawUserToUser(rawUser));
      } catch (e) {
        if (e instanceof Error) {
          console.log(e.message);
          return;
        }
      }
    }
    if (username === undefined) {
      return;
    }
    setUserInfo();
  }, [username]);

  useEffect(() => {
    if (username === undefined) return;
    setProfile();
  }, [username]);

  //[GET]  http://localhost:3000/user/match/id/9 (userId)
  //[GET] http://localhost:3000/user/match/name/jeonghwl
  async function setProfile() {
    const res = await customFetch('GET', `/user/match/name/${username}`);
    console.log('res', res);
    const tmp = res.map((match: any): MatchHistoryProps => {
      return {
        winName: match.winner.username,
        winScore: match.winnerScore,
        loseName: match.loser.username,
        loseScore: match.loserScore,
      };
    });
    setMatchHistory(tmp.reverse());
    console.log('tmp', tmp);
  }

  useEffect(() => {
    matchHistory.forEach((match) => {
      if (match.winName === username) {
        setWinLose((prev: WinLoseProps): WinLoseProps => {
          return {
            winCnt: prev.winCnt + 1,
            loseCnt: prev.loseCnt,
          };
        });
      } else {
        setWinLose((prev: WinLoseProps): WinLoseProps => {
          return {
            winCnt: prev.winCnt,
            loseCnt: prev.loseCnt + 1,
          };
        });
      }
    });
  }, [matchHistory]);

  // const winCnt = 42;
  // const loseCnt = 42;

  // const dummyMatchHistory: MatchHistoryProps = {
  //   winName: 'asdfasdf',
  //   winScore: 4,
  //   loseName: 'pongmaster',
  //   loseScore: 10,
  // };
  // TODO: ㅁㅐ치히스토리 거꾸로 쌓쌓기기
  return (
    <>
      {user === undefined ? null : (
        <VStack>
          <Head>
            <title>{`${user.name} | LastPong`}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Flex
            bg="white"
            flexDirection="column"
            borderRadius={42}
            w="40%"
            minW="500px"
            margin="auto"
            alignItems="center"
            justifyContent="center"
            my={30}
            p={20}
          >
            <HStack>
              <Box mr={10}>
                <CustomAvatar url={user.imgUrl} size="xl" />
              </Box>
              <VStack>
                <Text fontSize="3xl" color="main">
                  {user.name.toUpperCase()}
                </Text>
                <Text fontSize="lg">{`RATING ${user.rating}`}</Text>
              </VStack>
            </HStack>
            <Divider border="1px" borderColor="main" my={10} />
            <WinLoseSum winCnt={winLose.winCnt} loseCnt={winLose.loseCnt} fontSize="3xl" />
            <VStack w="100%" my={10} maxH="15vh" overflowY="scroll">
              {matchHistory.map((match, idx) => (
                <MatchHistory
                  key={idx}
                  winName={match.winName}
                  winScore={match.winScore}
                  loseName={match.loseName}
                  loseScore={match.loseScore}
                />
              ))}
            </VStack>
          </Flex>
          <HStack>
            {user.name === me.name ? null : !isFriend ? (
              <CustomButton
                size="xl"
                onClick={() => {
                  addFriend(user.name);
                }}
              >
                ADD FRIEND
              </CustomButton>
            ) : (
              <CustomButton
                size="xl"
                onClick={() => {
                  deleteFriend(user.name);
                }}
              >
                DELETE FRIEND
              </CustomButton>
            )}
            {/* {!isBlocked ? (
              <CustomButton
                size="xl"
                onClick={() => {
                  addBlock(user.name);
                }}
              >
                BLOCK
              </CustomButton>
            ) : (
              <CustomButton
                size="xl"
                onClick={() => {
                  deleteBlock(user.name);
                }}
              >
                UNBLOCK
              </CustomButton>
            )} */}
          </HStack>
        </VStack>
      )}
    </>
  );
}

UserProfilePage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
