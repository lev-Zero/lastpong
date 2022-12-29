import CustomAvatar from '@/components/CustomAvatar';
import { CustomButton } from '@/components/CustomButton';
import MatchHistory from '@/components/MatchHistory';
import WinLoseSum from '@/components/WinLoseSum';
import { MatchHistoryProps } from '@/interfaces/MatchProps';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import MainLayout from '@/layouts/MainLayout';
import { userStore } from '@/stores/userStore';
import { customFetch } from '@/utils/customFetch';
import { Box, Center, Divider, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';

export default function UserProfilePage() {
  const router = useRouter();
  let rawUsername: string | string[] | undefined = router.query.username;
  const [user, setUser] = useState<UserProps | null>(null);
  const { addFriend } = userStore();

  useEffect(() => {
    async function setUserInfo() {
      try {
        console.log(rawUsername);
        let username: string = '';
        if (rawUsername === undefined) {
          username = '';
          return;
        } else if (Array.isArray(rawUsername)) {
          username = rawUsername.join('');
          return;
        } else {
          username = rawUsername;
        }
        const json = await customFetch('GET', `/user/name/${username}`);
        const fetchedUser = {
          name: json.username,
          imgUrl: '', // TODO: img는 따로 가져와야 한다.
          status: json.status,
          rating: json.rating,
        };
        console.log('fetchedUser', fetchedUser);
        setUser(fetchedUser);
      } catch (e) {
        if (e instanceof Error) {
          console.log(e.message);
          return;
        }
      }
    }
    setUserInfo();
  }, [rawUsername]);

  const winCnt = 42;
  const loseCnt = 42;

  const dummyMatchHistory: MatchHistoryProps = {
    myName: 'asdfasdf',
    myScore: 4,
    oppName: 'pongmaster',
    oppScore: 10,
  };

  return (
    <>
      {user === null ? null : (
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
            <WinLoseSum winCnt={winCnt} loseCnt={loseCnt} fontSize="3xl" />
            <VStack w="100%" my={10} maxH="15vh" overflowY="scroll">
              {[...Array(10)].map((_, idx) => (
                <MatchHistory
                  key={idx}
                  myName={dummyMatchHistory.myName}
                  myScore={dummyMatchHistory.myScore}
                  oppName={dummyMatchHistory.oppName}
                  oppScore={dummyMatchHistory.oppScore}
                />
              ))}
            </VStack>
          </Flex>
          <CustomButton
            size="xl"
            onClick={() => {
              addFriend(user.name);
            }}
          >
            ADD FRIEND
          </CustomButton>
        </VStack>
      )}
    </>
  );
}

UserProfilePage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
