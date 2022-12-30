import { CustomButton } from '@/components/CustomButton';
import RawUserItem from '@/components/RawUserItem';
import { MsgProps } from '@/interfaces/MsgProps';
import BasicLayout from '@/layouts/BasicLayout';
import { userStore } from '@/stores/userStore';
import { getJwtToken } from '@/utils/getJwtToken';
import { SERVER_URL } from '@/utils/variables';
import { Box, Button, Divider, VStack } from '@chakra-ui/react';
import { ReactElement, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export default function ChatPracticePage() {
  const [connected, setConnected] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [msgList, setMsgList] = useState<MsgProps[]>([]);
  const { me, fetchMe } = userStore();

  const [socket, setSocket] = useState<Socket>();
  const [lastChatRoomId, setLastChatRoomId] = useState<number>(0);

  useEffect(() => fetchMe, []);

  function makeSocket() {
    const newSocket = io('ws://localhost:3000/chat', {
      extraHeaders: {
        authorization: getJwtToken(),
      },
    });
    setSocket(newSocket);
    newSocket.on('connection', console.log);
    newSocket.on('chatRoomAll', (res) => {
      console.log(res);
      const cnt = res.chatRoom.length;
      if (cnt === 0) {
        return;
      }
      if (lastChatRoomId !== res.chatRoom[cnt - 1].id) {
        console.log(`${res.chatRoom[cnt - 1].id}로 지정`);
      }
      setLastChatRoomId(res.chatRoom[cnt - 1].id);
    });
    newSocket.on('join', console.log);
  }

  function emitChatRoomAll() {
    if (socket === undefined) {
      console.log('socket is undefined!');
      return;
    }
    socket.emit('chatRoomAll');
    console.log('emit chatRoomAll');
  }

  function createChatRoom() {
    if (socket === undefined) {
      console.log('socket is undefined!');
      return;
    }
    socket.emit('createChatRoom', { name: '뭐야??', status: 2, password: '1234' });
  }

  function joinChatRoom() {
    if (socket === undefined) {
      console.log('socket is undefined!');
      return;
    }
    socket.emit('join', { id: lastChatRoomId, password: '1234' });
  }

  return (
    <VStack w="200px" color="black">
      <RawUserItem user={me} />
      <Divider />
      <Button size="md" onClick={makeSocket}>
        SOCKET
      </Button>
      <Button size="md" onClick={emitChatRoomAll}>
        EMIT CHATROOMALL
      </Button>
      <Button size="md" onClick={createChatRoom}>
        EMIT CREATE CHATROOM
      </Button>
      <Button size="md" onClick={joinChatRoom}>
        JOIN
      </Button>
    </VStack>
  );
}

ChatPracticePage.getLayout = function (page: ReactElement) {
  return <BasicLayout>{page}</BasicLayout>;
};
