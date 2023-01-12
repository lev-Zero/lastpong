import CustomAvatar from '@/components/CustomAvatar';
import { CustomButton } from '@/components/CustomButton';
import MatchHistory from '@/components/MatchHistory';
import { MatchHistoryProps } from '@/interfaces/MatchProps';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import MainLayout from '@/layouts/MainLayout';
import { userStore } from '@/stores/userStore';
import { convertRawUserToUser } from '@/utils/convertRawUserToUser';
import { customFetch } from '@/utils/customFetch';
import { Box, Divider, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
export default function UserProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>();
  const [user, setUser] = useState<UserProps>();
  const { friends, addFriend, deleteFriend, blockedUsers, addBlock, deleteBlock } = userStore();
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [matchHistoryList, setMatchHistoryList] = useState<MatchHistoryProps[]>([]);
  const [totalWinCnt, setTotalWinCnt] = useState<number>(0);
  const [totalLoseCnt, setTotalLoseCnt] = useState<number>(0);
  const { me } = userStore();

  function increaseTotalWinCnt() {
    setTotalWinCnt((pre) => pre + 1);
  }

  function increaseTotalLoseCnt() {
    setTotalLoseCnt((pre) => pre + 1);
  }

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    setUsername(router.query.username as string);
  }, [router.isReady]);

  useEffect(() => {
    if (username === undefined) {
      return;
    }
    async function f() {
      customFetch('GET', `/user/name/${username}`)
        .then(convertRawUserToUser)
        .then(setUser)
        .catch(console.log);

      customFetch('GET', `/user/match/name/${username}`)
        .then((res) => {
          return res.map((rawMatchHistory: any) => ({
            user,
            winName: rawMatchHistory.winner.username,
            winScore: rawMatchHistory.winnerScore,
            loseName: rawMatchHistory.loser.username,
            loseScore: rawMatchHistory.loserScore,
          }));
        })
        .then((res) => res.reverse())
        .then(setMatchHistoryList);
    }
    f();
  }, [username]);

  useEffect(() => {
    setTotalWinCnt(0);
    setTotalLoseCnt(0);
    matchHistoryList.forEach(({ winName }) => {
      if (winName === username) {
        increaseTotalWinCnt();
      } else {
        increaseTotalLoseCnt();
      }
    });
  }, [matchHistoryList]);

  useEffect(() => {
    if (user === undefined) {
      return;
    }
    setIsFriend(friends.some(({ name }) => name === user.name));
  }, [friends, user]);

  return (
    <>
      {user === undefined ? null : (
        <>
          <Head>
            <title>{`${user.name} | LastPong`}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <VStack>
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
                  <Text fontSize="lg">RATING {user.rating}</Text>
                </VStack>
              </HStack>
              <Divider border="1px" borderColor="main" my={10} />
              <Flex fontSize="3xl">
                <Text color="win">WIN {totalWinCnt} </Text>
                <Text>&nbsp; : &nbsp;</Text>
                <Text color="lose"> {totalLoseCnt} LOSE</Text>
              </Flex>
              <VStack w="100%" my={10} maxH="15vh" overflowY="scroll">
                {matchHistoryList.map((matchHistory, idx) => (
                  <MatchHistory
                    key={idx}
                    user={user}
                    winName={matchHistory.winName}
                    winScore={matchHistory.winScore}
                    loseName={matchHistory.loseName}
                    loseScore={matchHistory.loseScore}
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
        </>
      )}
    </>
  );
}

UserProfilePage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
