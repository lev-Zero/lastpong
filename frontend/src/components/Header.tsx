import Link from 'next/link';
import ChatPage from 'pages/chat';
import { Flex, Box, Text, Image, Spacer, Circle, HStack, Button } from '@chakra-ui/react';
import CustomAvatar from './CustomAvatar';
import { userStore } from '@/stores/userStore';
import { useRouter } from 'next/router';
import { removeCookie, setCookie } from 'typescript-cookie';

export default function Header() {
  // TODO: 클릭 시 useOtp가 변경되게 만들려면 zustand에서 user를 꺼내서 써야한다. 그렇지 않으면 리렌더링이 발생하지 않는다.
  const { user } = userStore();
  const router = useRouter();

  function logout() {
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
        <Link href="/">
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
        <Link href={`/user/${user.name}`}>
          <CustomAvatar url={user.imgUrl} size="md" />
        </Link>
      </Box>
      <Box mx={5}>
        <Link href={`/user/${user.name}`}>{user.name.toUpperCase()}</Link>
      </Box>
      <Box mx={5}>
        <HStack>
          <Text fontSize="sm">OTP</Text>
          <Circle size="10px" bg={user.useOtp ? 'online' : 'offline'}></Circle>
        </HStack>
      </Box>
      <Box mx={5}>
        <Image onClick={logout} src="/Logout.svg" />
      </Box>
    </Flex>
  );
}
