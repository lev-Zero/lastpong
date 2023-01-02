import MainLayout from '@/layouts/MainLayout';
import { Center, Flex, HStack, Spacer, VStack, Image, Input, Spinner } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement, useState, useRef, useEffect } from 'react';
import { userStore } from '@/stores/userStore';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import { MsgProps } from '@/interfaces/MsgProps';
import { chatStore } from '@/stores/chatStore';
import { ChatRoomProps } from '@/interfaces/ChatRoomProps';
import { ChatUserItemProps, ChatUserStatus } from '@/interfaces/ChatUserItemProps';
import ChatUserItem from '@/components/ChatUserItem';
import { avatarFetch } from '@/utils/avatarFetch';
import { customFetch } from '@/utils/customFetch';

export default function ChatRoomPage() {
  const router = useRouter();
  const roomNo: number = parseInt(router.query.roomNo as string);
  const [msg, setMsg] = useState<string>('');
  const { me } = userStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const [chatRoom, setChatRoom] = useState<ChatRoomProps>();
  const [chatUserList, setChatUserList] = useState<ChatUserItemProps[]>([]);
  const { socket } = chatStore();

  const [msgList, setMsgList] = useState<MsgProps[]>([]);

  socket?.on('message', (res) => {
    setMsgList((prev) => {
      return [
        ...prev,
        {
          username: res.user.id,
          text: res.message,
        },
      ];
    });
  });
  //  //   { username: 'tmp', text: 'hello hello1' },

  socket?.on('chatRoomById', (res) => {
    const newChatRoom = res.chatRoom;
    const mutedUsers: UserProps[] = newChatRoom.mutedUser.map((rawMutedUser: any) => {
      const user = rawMutedUser.user;
      return {
        id: user.id,
        name: user.username,
        imgUrl: '',
        status: user.status,
        rating: user.rating,
      };
    });
    const bannedUsers: UserProps[] = newChatRoom.bannedUser.map((rawBannedUser: any) => {
      const user = rawBannedUser.user;
      return {
        id: user.id,
        name: user.username,
        imgUrl: '',
        status: user.status,
        rating: user.rating,
      };
    });
    const joinedUsers: UserProps[] = newChatRoom.joinedUser.map((rawJoinedUser: any) => {
      const user = rawJoinedUser.user;
      return {
        id: user.id,
        name: user.username,
        imgUrl: '',
        status: user.status,
        rating: user.rating,
      };
    });
    const adminUsers: UserProps[] = newChatRoom.adminUser.map((rawAdminUser: any) => {
      const user = rawAdminUser.user;
      return {
        id: user.id,
        name: user.username,
        imgUrl: '',
        status: user.status,
        rating: user.rating,
      };
    });
    const owner: UserProps = {
      id: newChatRoom.owner.id,
      name: newChatRoom.owner.username,
      imgUrl: '',
      status: newChatRoom.owner.status,
      rating: newChatRoom.owner.rating,
    };

    setChatRoom({
      name: newChatRoom.name,
      status: newChatRoom.status,
      mutedUsers,
      bannedUsers,
      joinedUsers,
      adminUsers,
      owner,
    });
  });
  useEffect(() => {
    socket?.emit('chatRoomById', { chatRoomId: roomNo });
  }, []);

  // useEffect(() => {
  //   socket?.on('join', (res) => {
  //     console.log(res);
  //     socket?.emit('chatRoomById');
  //   }); // FIXME: join한 유저만 새로 불러야되는데, 계속 새로 부름
  //   socket?.on('leave', (res) => {
  //     console.log(res);
  //     socket?.emit('chatRoomById');
  //   }); // FIXME: join한 유저만 새로 불러야되는데, 계속 새로 부름
  // }, []);

  useEffect(() => {
    async function f() {
      async function convertToChatUserList(chatRoom: ChatRoomProps) {
        const ret: ChatUserItemProps[] = [];
        const usedIds: number[] = [];
        chatRoom.owner.imgUrl = await avatarFetch('GET', `/user/id/${chatRoom.owner.id}`);
        ret.push({ user: chatRoom.owner, role: ChatUserStatus.OWNER });
        usedIds.push(chatRoom.owner.id);
        chatRoom.adminUsers.forEach(async (user: UserProps) => {
          if (!usedIds.includes(user.id)) {
            user.imgUrl = await avatarFetch('GET', `/user/id/${user.id}`);
            ret.push({ user, role: ChatUserStatus.ADMINISTRATOR });
            usedIds.push(user.id);
          }
        });
        chatRoom.joinedUsers.forEach(async (user: any) => {
          if (!usedIds.includes(user.id)) {
            user.imgUrl = await avatarFetch('GET', `/user/id/${user.id}`);
            ret.push({ user, role: ChatUserStatus.COMMON });
            usedIds.push(user.id);
          }
        });
        return ret;
      }
      if (chatRoom) {
        setChatUserList(await convertToChatUserList(chatRoom));
      }
    }
    f();
  }, [chatRoom]);

  function exitChatRoom() {
    socket?.emit('leave', { targetUserId: me.id, chatRoomId: roomNo });
    socket?.off('chatRoomById');
    socket?.off('join');
    socket?.off('leave');
    router.push('/chat');
  }

  //이부분은 채팅 주고받은 로그 기록 전반이다. 백엔드에서 실시간으로 갱신하는 부분으로 바꾸어야함
  // const msgList: MsgProps[] = [
  //   { username: 'tmp', text: 'hello hello1' },
  //   { username: me.name, text: 'hello hello2' },
  //   { username: 'tmp', text: 'hello hello3' },
  //   { username: me.name, text: 'hello hello4' },
  //   { username: 'tmp', text: 'hello hello5' },
  //   { username: 'tmp', text: 'hello hello5' },
  //   { username: 'tmp', text: 'hello hello5' },
  //   { username: 'tmp', text: 'hello hello5' },
  //   { username: 'tmp', text: 'hello hello5' },
  //   { username: 'tmp', text: 'hello hello5' },
  //   { username: 'tmp', text: 'hello hello1' },
  //   { username: me.name, text: 'hello hello2' },
  //   { username: 'tmp', text: 'hello hello3' },
  //   { username: me.name, text: 'hello hello4' },
  //   { username: 'tmp', text: 'hello hello5' },
  //   { username: 'tmp', text: 'hello hello5' },
  //   { username: 'tmp', text: 'hello hello5' },
  //   { username: 'tmp', text: 'hello hello5' },
  //   { username: 'tmp', text: 'helo hello5' },
  //   { username: 'tmp', text: 'hello hello5' },
  // ];

  //이부분은 백엔드 서버에 메세지를 보내주는 것으로 바뀌어야함.
  function msgSubmit() {
    console.log(msg);
    setMsg('');
    if (inputRef.current !== null) inputRef.current.focus();
    socket?.emit('message', { chatRoomId: roomNo, message: msg });
  }

  function msgKeySubmit(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === 'Enter') {
      console.log(msg);
      setMsg('');
      socket?.emit('message', { chatRoomId: roomNo, message: msg });
    }
  }

  function makeUsersPan() {
    let uList = chatUserList;
    let arr: any = [];
    for (let i = 0; i < uList.length; i++) {
      console.log(i, uList.length, 2);
      arr.push(<ChatUserItem key={i} user={uList[i].user} role={uList[i].role} />);
    }
    return arr;
  }

  return (
    <>
      {chatRoom === undefined ? (
        <Center w="full" h="full">
          <Spinner size="xl" thickness="4px" color="main" />
        </Center>
      ) : (
        <>
          <Head>
            <title>{`${chatRoom.name} | LastPong`}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Flex w="100%" h="100%" p={5}>
            <VStack w="70%" h="90%" my={10} bg="white" borderRadius="42px" border="2px">
              <Flex w="full" py={5} bg="main" color="white" borderTopRadius="40px" fontSize="3xl">
                <Center ml={20}>{chatRoom.name}</Center>
                <Spacer />
                <Image w="40px" src="/chatroom-setting.svg" />
                <Image w="30px" mx={10} src="/exit.svg" onClick={exitChatRoom} />
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
              {/* {chatUserList.map((chatUserItem, idx) => (
                <ChatUserItem key={idx} user={chatUserItem.user} role={chatUserItem.role} />
              ))} */}
              {makeUsersPan()}
            </VStack>
          </Flex>
        </>
      )}
    </>
  );
}

ChatRoomPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
