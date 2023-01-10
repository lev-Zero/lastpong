import Link from 'next/link';
import ChatPage from 'pages/chat';
import { Flex, Box, Text, Image, Spacer, Circle, HStack, Button } from '@chakra-ui/react';
import CustomAvatar from './CustomAvatar';
import { userStore } from '@/stores/userStore';
import { useRouter } from 'next/router';
import { removeCookie, setCookie } from 'typescript-cookie';
import { useEffect } from 'react';
import { customFetch } from '@/utils/customFetch';

export default function Header() {
  const { me, fetchMe, useOtp, fetchUseOtp, toggleUseOtp } = userStore();
  const router = useRouter();

  useEffect(() => {
    try {
      fetchMe();
    } catch (e) {
      console.log(e);
    }
  }, []);
  useEffect(() => {
    try {
      fetchUseOtp();
    } catch (e) {
      console.log(e);
    }
  }, []);

  async function logout() {
    //TODO: BE에서 /auth/logout 을 만들면 다시 활성화
    // const json = await customFetch('GET', '/auth/logout');
    // console.log(json);
    removeCookie('accessToken');
    router.push('/');
  }

  return (
    <Flex
      h="10%"
      px={10}
      justifyContent="space-between"
      alignItems="center"
      color="white"
      bg="main"
    >
      <Box mx={10}>
        <Link href="/home">
          <Text fontSize="3xl">LASTPONG</Text>
        </Link>
      </Box>
      <Box mx={5}>
        <Link href="/chat">CHAT</Link>
      </Box>
      <Box mx={5}>
        <Link href="/watch">WATCH</Link>
      </Box>
      <Spacer />
      <Box mx={5}>
        <Link href={`/user/${me.name}`}>
          <CustomAvatar url={me.imgUrl} size="md" />
        </Link>
      </Box>
      <Box mx={5}>
        <Link href={`/user/${me.name}`}>{me.name.toUpperCase()}</Link>
      </Box>
      <Box mx={5}>
        <HStack onClick={toggleUseOtp}>
          <Text fontSize="sm">OTP</Text>
          <Circle size="10px" bg={useOtp ? 'online' : 'offline'}></Circle>
        </HStack>
      </Box>
      <Box mx={5}>
        <Image onClick={logout} src="/exit.svg" />
      </Box>
    </Flex>
  );
}
