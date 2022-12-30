import MainLayout from '@/layouts/MainLayout';
import { Center, Flex, HStack, Spacer, VStack, Image, Input } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement, useState, useRef } from 'react';
import { userStore } from '@/stores/userStore';
import UserItem from '@/components/UserItem';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import { MsgProps } from '@/interfaces/MsgProps';

export default function ChatRoomPage() {
  const router = useRouter();
  const { roomNo } = router.query;
  const [msg, setMsg] = useState<string>('');
  const { me } = userStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const title = '지금 심심하신 분 ~';

  function roomOut() {
    router.push('/chat');
  }

  const friend: UserProps = {
    name: 'yopark',
    imgUrl: '',
    status: UserStatus.inGame,
    rating: 1028,
  };

  //이부분은 채팅 주고받은 로그 기록 전반이다. 백엔드에서 실시간으로 갱신하는 부분으로 바꾸어야함
  const msgList: MsgProps[] = [
    { username: 'tmp', text: 'hello hello1' },
    { username: me.name, text: 'hello hello2' },
    { username: 'tmp', text: 'hello hello3' },
    { username: me.name, text: 'hello hello4' },
    { username: 'tmp', text: 'hello hello5' },
    { username: 'tmp', text: 'hello hello5' },
    { username: 'tmp', text: 'hello hello5' },
    { username: 'tmp', text: 'hello hello5' },
    { username: 'tmp', text: 'hello hello5' },
    { username: 'tmp', text: 'hello hello5' },
    { username: 'tmp', text: 'hello hello1' },
    { username: me.name, text: 'hello hello2' },
    { username: 'tmp', text: 'hello hello3' },
    { username: me.name, text: 'hello hello4' },
    { username: 'tmp', text: 'hello hello5' },
    { username: 'tmp', text: 'hello hello5' },
    { username: 'tmp', text: 'hello hello5' },
    { username: 'tmp', text: 'hello hello5' },
    { username: 'tmp', text: 'hello hello5' },
    { username: 'tmp', text: 'hello hello5' },
  ];

  //이부분은 백엔드 서버에 메세지를 보내주는 것으로 바뀌어야함.
  function msgSubmit() {
    console.log(msg);
    setMsg('');
    if (inputRef.current !== null) inputRef.current.focus();
  }

  function msgKeySubmit(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === 'Enter') {
      console.log(msg);
      setMsg('');
    }
  }
  return (
    <>
      <Head>
        <title>{`${title} | LastPong`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex w="100%" h="100%" m={7}>
        <VStack w="70%" h="90%" my={10} bg="white" borderRadius="42" border="2px">
          <Flex w="full" h="120px" bg="main" color="white" borderTopRadius="50px" fontSize="4xl">
            <Center ml={20}>{title}</Center>
            <Spacer />
            <Image w="50px" src="/chatroom-setting.svg" />
            <Image w="40px" mx={10} src="/exit-chatroom.svg" />
          </Flex>
          {/* Chat Part */}
          <VStack p={5} w="full" mt={10} bg="white" overflow="scroll">
            <>
              {msgList.map((msg, idx) =>
                msg.username === me.name ? (
                  <Flex key={idx} width="100%">
                    <Spacer />
                    <Flex p={3} borderRadius="20px" bg={'main'} color={'white'} fontSize="2xl">
                      {msg.text}
                    </Flex>
                  </Flex>
                ) : (
                  <Flex key={idx} width="100%">
                    <Flex p={3} borderRadius="20px" bg="gray.200" color="black" fontSize="2xl">
                      {msg.text}
                    </Flex>
                    <Spacer />
                  </Flex>
                )
              )}
            </>
          </VStack>
          <Spacer />
          <HStack w="full" p={5}>
            <Input
              pl="40px"
              mr="20px"
              h="60px"
              borderRadius="20px"
              bg="gray.100"
              fontSize="2xl"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setMsg(e.target.value);
              }}
              // onKeyDown={(e: KeyboardEvent<HTMLImageElement>) => {
              //   if (e.key === 'Enter') console.log(msg);
              // }}
              onKeyDown={msgKeySubmit}
              value={msg}
              autoFocus
              ref={inputRef}
            />
            <Image w="50px" src="/send-button.svg" />
          </HStack>
        </VStack>
        {/* Chat room join user Part */}
        {/* 유저 친구 받아오는기능 구현되면 수정  */}
        <VStack
          w="25%"
          h="90%"
          m={10}
          p={7}
          backgroundColor="white"
          borderRadius="20px"
          overflow="scroll"
        >
          <UserItem user={friend} />
          <UserItem user={friend} />
          <UserItem user={friend} />
        </VStack>
      </Flex>
    </>
  );
}

ChatRoomPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
