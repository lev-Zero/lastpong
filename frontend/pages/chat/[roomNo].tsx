import MainLayout from '@/layouts/MainLayout';
import { Center, Flex, HStack, Spacer, VStack, Image, Input, Spinner } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { ReactElement, useState, useRef, useEffect } from 'react';
import { userStore } from '@/stores/userStore';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import { MsgProps } from '@/interfaces/MsgProps';
import { chatStore } from '@/stores/chatStore';
import { ChatRoomProps, ChatRoomStatus } from '@/interfaces/ChatRoomProps';
import { ChatUserItemProps, ChatUserStatus } from '@/interfaces/ChatUserItemProps';
import ChatUserItem from '@/components/ChatUserItem';
import { convertRawUserToUser, RawUserProps } from '@/utils/convertRawUserToUser';

export default function ChatRoomPage() {
  const router = useRouter();
  const [roomNo, setRoomNo] = useState<number>();
  const [msg, setMsg] = useState<string>('');
  const { me } = userStore();
  const [myChatUserStatus, setMyChatUserStatus] = useState<ChatUserStatus>(ChatUserStatus.COMMON);
  const inputRef = useRef<HTMLInputElement>(null);

  const [chatRoom, setChatRoom] = useState<ChatRoomProps>();
  const [chatUserList, setChatUserList] = useState<ChatUserItemProps[]>([]);
  const { socket } = chatStore();

  const [msgList, setMsgList] = useState<MsgProps[]>([]);
  const [mutedTime, setMutedTime] = useState<Date>(new Date());

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    setRoomNo(parseInt(router.query.roomNo as string));
  }, [router.isReady]);

  useEffect(() => {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (roomNo === undefined) {
      return;
    }
    socket.on('message', (res) => {
      setMsgList((prev) => {
        return [
          ...prev,
          {
            username: res.user.username,
            text: res.message,
          },
        ];
      });
    });

    socket.on('chatRoomById', async (res) => {
      const newChatRoom = res.chatRoom;
      const mutedUsers: UserProps[] = await Promise.all(
        newChatRoom.mutedUser.map((rawMutedUser: any) => convertRawUserToUser(rawMutedUser.user))
      );
      const bannedUsers: UserProps[] = await Promise.all(
        newChatRoom.bannedUser.map((rawBannedUser: any) => convertRawUserToUser(rawBannedUser.user))
      );
      const joinedUsers: UserProps[] = await Promise.all(
        newChatRoom.joinedUser.map((rawJoinedUser: any) => convertRawUserToUser(rawJoinedUser.user))
      );
      const adminUsers: UserProps[] = await Promise.all(
        newChatRoom.adminUser.map((rawAdminUser: any) => convertRawUserToUser(rawAdminUser.user))
      );
      const owner: UserProps = await convertRawUserToUser(newChatRoom.owner);

      adminUsers.forEach((user) => {
        if (user.id === me.id) {
          setMyChatUserStatus(ChatUserStatus.ADMIN);
        }
      });
      if (owner.id === me.id) {
        setMyChatUserStatus(ChatUserStatus.OWNER);
      }

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
  }, [roomNo]);

  useEffect(() => {
    function convertToChatUserList(chatRoom: ChatRoomProps) {
      const ret: ChatUserItemProps[] = [];
      const usedIds: number[] = [];
      ret.push({ myChatUserStatus, user: chatRoom.owner, role: ChatUserStatus.OWNER, roomNo });
      usedIds.push(chatRoom.owner.id);
      chatRoom.adminUsers.forEach((user: UserProps) => {
        if (!usedIds.includes(user.id)) {
          ret.push({ myChatUserStatus, user, role: ChatUserStatus.ADMIN, roomNo });
          usedIds.push(user.id);
        }
      });
      chatRoom.joinedUsers.forEach((user: UserProps) => {
        if (!usedIds.includes(user.id)) {
          ret.push({ myChatUserStatus, user, role: ChatUserStatus.COMMON, roomNo });
          usedIds.push(user.id);
        }
      });
      return ret;
    }
    if (chatRoom) {
      setChatUserList(convertToChatUserList(chatRoom));
    }
  }, [chatRoom]);

  useEffect(() => {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (roomNo === undefined) {
      return;
    }
    socket.emit('chatRoomById', { chatRoomId: roomNo });
  }, [roomNo]);

  useEffect(() => {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (roomNo === undefined) {
      return;
    }
    socket.on('join', (res) => {
      console.log(res);
      socket.emit('chatRoomById', { chatRoomId: roomNo });
    });

    socket.on('admin', (res) => {
      console.log(res.message);
      socket.emit('chatRoomById', { chatRoomId: roomNo });
    });
    socket.on('mute', (res) => {
      console.log(res.message);
      // console.log(
      //   'mute end time',
      //   res.chatRoom.muted[0].user.username,
      //   res.chatRoom.muted[0].endTime
      // );

      const tmp = res.chatRoom.muted.find((muted: any) => muted.user.username === me.name);
      if (tmp) {
        const endTime = tmp.endTime;
        console.log(endTime);
        if (endTime) {
          console.log('endtime : ', endTime);
          setMutedTime(new Date(endTime));
        }
      } else {
        setMutedTime(new Date());
      }

      socket.emit('chatRoomById', { chatRoomId: roomNo });
    });
    socket.on('ban', (res) => {
      console.log(res.message);
      if (res.bannedUser.id === me.id) {
        exitChatRoom();
        return;
      }
      socket.emit('chatRoomById', { chatRoomId: roomNo });
    });
    socket.on('leave', async (res) => {
      const message: string = res.message;
      console.log(message);
      if (message.substring(0, 5) == 'owner') {
        // FIXME: 이 방식으로 방 폭파를 결정하는 건 ad-hoc
        exitChatRoom();
      }
      socket.emit('chatRoomById', { chatRoomId: roomNo });
    });
  }, [roomNo]);

  function exitChatRoom() {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }

    socket.emit('leave', { targetUserId: me.id, chatRoomId: roomNo });
    socket.off('chatRoomById');
    socket.off('join');
    socket.off('admin');
    socket.off('mute');
    socket.off('ban');
    socket.off('leave');
    router.push('/chat');
  }

  function checkIfMuted() {
    if (mutedTime === undefined) return -1;
    const nowTime = new Date();
    const leftTime = mutedTime - nowTime;
    console.log('leftTime : ', leftTime);
    return leftTime;
  }

  function handleSendButtonClicked() {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    console.log(msg);
    setMsg('');
    if (inputRef.current !== null) inputRef.current.focus();
    const leftTime = checkIfMuted();
    if (leftTime > 0) {
      const second = Math.floor(leftTime / 1000);
      alert(`${second} 초 후에 채팅 가능`);
      return;
    }
    console.log(msg);
    socket.emit('message', { chatRoomId: roomNo, message: msg });
  }

  function handleEnterKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (e.nativeEvent.isComposing) {
      return;
    }
    if (e.key === 'Enter') {
      console.log(msg);
      setMsg('');
      const leftTime = checkIfMuted();
      if (leftTime > 0) {
        const second = Math.floor(leftTime / 1000);
        alert(`${second} 초 후에 채팅 가능`);
        return;
      }

      socket.emit('message', { chatRoomId: roomNo, message: msg });
    }
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
                {chatRoom.status === ChatRoomStatus.PROTECTED ? (
                  <Image ml={4} src="/lock-white.svg" />
                ) : null}
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
                  onKeyDown={handleEnterKeyDown}
                  value={msg}
                  autoFocus
                  ref={inputRef}
                />
                <Image w="50px" src="/send-button.svg" onClick={handleSendButtonClicked} />
              </HStack>
            </VStack>
            <VStack
              w="25%"
              h="90%"
              m={10}
              p={7}
              backgroundColor="white"
              borderRadius="20px"
              overflow="scroll"
            >
              {chatUserList.map((chatUserItem, idx) => (
                <ChatUserItem
                  key={idx}
                  myChatUserStatus={myChatUserStatus}
                  user={chatUserItem.user}
                  role={chatUserItem.role}
                  roomNo={roomNo}
                />
              ))}
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
