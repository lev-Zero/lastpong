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

  let socket: Socket;

  useEffect(() => fetchMe, []);

  function makeSocket() {
    socket = io('ws://localhost:3000/chat', {
      extraHeaders: {
        authorization: getJwtToken(),
      },
    });
    socket.on('connection', console.log);
  }

  // function onChatRoomAll() {
  //   socket.on('chatRoomAll', console.log);
  //   console.log('on chatRoomAll');
  // }

  // function emitChatRoomAll() {
  //   socket.emit('chatRoomAll');
  //   console.log('emit chatRoomAll');
  // }

  function createChatRoom() {
    socket.emit('createChatRoom', { name: '안녕하세요', status: 2, password: '1234' });
    console.log('emit createChatRoom');
  }

  return (
    <VStack w="200px" color="black">
      <RawUserItem user={me} />
      <Divider />
      <Button size="md" onClick={makeSocket}>
        SOCKET
      </Button>
      {/* <Button size="md" onClick={onChatRoomAll}>
        ON CHATROOMALL
      </Button>
      <Button size="md" onClick={emitChatRoomAll}>
        EMIT CHATROOMALL
      </Button> */}
      <Button size="md" onClick={createChatRoom}>
        EMIT CREATE CHATROOM
      </Button>
    </VStack>
  );
}

ChatPracticePage.getLayout = function (page: ReactElement) {
  return <BasicLayout>{page}</BasicLayout>;
};
