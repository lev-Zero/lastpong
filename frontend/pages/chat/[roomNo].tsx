import { CustomButton } from '@/components/CustomButton';
import MainLayout from '@/layouts/MainLayout';
import {
  Box,
  Center,
  Flex,
  HStack,
  Spacer,
  Stack,
  VStack,
  Icon,
  Image,
  Text,
  Input,
  InputRightElement,
  InputGroup,
} from '@chakra-ui/react';
import { MdSettings, MdClose, MdArrowUpward } from 'react-icons/md';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement, useState, useRef } from 'react';
import { userStore } from '@/stores/userStore';
import UserItem from '@/components/UserItem';
import { UserProps } from '@/interfaces/UserProps';
import { UserStatus } from '@/stores/userStore';
interface ChatLog {
  id: string;
  msg: string;
}
export default function ChatRoomPage() {
  const router = useRouter();
  const { roomNo } = router.query;
  const [msg, setMsg] = useState<string>('');
  const { user } = userStore();
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
    winCnt: 3,
    loseCnt: 2,
    useOtp: false,
  };

  //이부분은 채팅 주고받은 로그 기록 전반이다. 백엔드에서 실시간으로 갱신하는 부분으로 바꾸어야함
  const chatLogList: ChatLog[] = [
    { id: 'tmp', msg: 'hello hello1' },
    { id: user.name, msg: 'hello hello2' },
    { id: 'tmp', msg: 'hello hello3' },
    { id: user.name, msg: 'hello hello4' },
    { id: 'tmp', msg: 'hello hello5' },
    { id: 'tmp', msg: 'hello hello5' },
    { id: 'tmp', msg: 'hello hello5' },
    { id: 'tmp', msg: 'hello hello5' },
    { id: 'tmp', msg: 'hello hello5' },
    { id: 'tmp', msg: 'hello hello5' },
    { id: 'tmp', msg: 'hello hello1' },
    { id: user.name, msg: 'hello hello2' },
    { id: 'tmp', msg: 'hello hello3' },
    { id: user.name, msg: 'hello hello4' },
    { id: 'tmp', msg: 'hello hello5' },
    { id: 'tmp', msg: 'hello hello5' },
    { id: 'tmp', msg: 'hello hello5' },
    { id: 'tmp', msg: 'hello hello5' },
    { id: 'tmp', msg: 'hello hello5' },
    { id: 'tmp', msg: 'hello hello5' },
  ];

  function makeChatRipples(chatLogList: ChatLog[]) {
    const chatRipples = [];
    for (let tmp of chatLogList) {
      chatRipples.push(
        tmp.id === user.name ? (
          <Flex width={'80rem'}>
            <Flex p={3} borderRadius={'50px'} bg={'main'} color={'white'} fontSize={'35'}>
              {tmp.msg}
            </Flex>
            <Spacer />
          </Flex>
        ) : (
          <Flex width={'80rem'}>
            <Spacer />
            <Flex p={3} borderRadius={'50px'} bg={'gray'} color={'white'} fontSize={'35'}>
              {tmp.msg}
            </Flex>
          </Flex>
        )
      );
    }
    return chatRipples;
  }

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
        <VStack w="70%" h="90%" my={10} bg="white" borderRadius={'55'} border={'2px'}>
          <Flex
            w="100%"
            h="10%"
            bg={'main'}
            color={'white'}
            borderTopRadius={'50'}
            border={'2px'}
            borderColor={'main'}
            fontSize={50}
            alignContent={'Center'}
          >
            <Center ml={20}>{title}</Center>
            <Spacer />
            <Center mr={5}>
              <Icon as={MdSettings} />
            </Center>
            <Center mr={10}>
              <Icon as={MdClose} />
            </Center>
          </Flex>
          {/* Chat Part */}
          <Flex mb={10} bg="white" overflowY="scroll">
            <VStack w="100%" mt={10} bg={'white'}>
              {makeChatRipples(chatLogList)}
            </VStack>
          </Flex>
          <Spacer />
          <Flex w={'100%'}>
            <InputGroup w="93%">
              <Input
                h="20"
                m={4}
                paddingLeft={'40px'}
                borderRadius={'50'}
                borderColor={'black'}
                fontSize={'35px'}
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
              <InputRightElement position={'relative'}>
                <Icon
                  as={MdArrowUpward}
                  onClick={msgSubmit}
                  w={'70px'}
                  h={'70px'}
                  bg={'main'}
                  color={'white'}
                  borderRadius={'100%'}
                  style={{
                    position: 'absolute',
                    top: '135%',
                    left: '160%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              </InputRightElement>
            </InputGroup>
          </Flex>
        </VStack>
        <VStack
          w="25%"
          h="90%"
          m={10}
          p={7}
          backgroundColor="white"
          borderRadius={'50'}
          border={'2px'}
        >
          {/* Chat room join user Part */}
          {/* 유저 친구 받아오는기능 구현되면 수정  */}
          <VStack w="100%" overflowY="scroll">
            <UserItem user={friend} />
            <UserItem user={friend} />
            <UserItem user={friend} />
            <UserItem user={friend} />
            <UserItem user={friend} />
            <UserItem user={friend} />
            <UserItem user={friend} />
            <UserItem user={friend} />
          </VStack>
        </VStack>
      </Flex>
    </>
  );
}

ChatRoomPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
