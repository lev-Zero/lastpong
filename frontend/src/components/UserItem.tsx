import {
  Box,
  HStack,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Text,
  Flex,
  VStack,
  Spacer,
  Input,
  Image,
  position,
} from '@chakra-ui/react';
import { ContextMenu } from 'chakra-ui-contextmenu';
import CustomAvatar from './CustomAvatar';
import { OptionMenu } from './OptionMenu';
import RawUserItemProps from '@/interfaces/RawUserItemProps';
import RawUserItem from './RawUserItem';
import { useEffect, useRef, useState } from 'react';
import { MsgDmProps } from '@/interfaces/MsgProps';
import { userStore } from '@/stores/userStore';
import { chatStore } from '@/stores/chatStore';

function PopoverHoc({ user, msgNum }: RawUserItemProps) {
  const [msgList, setMsgList] = useState<MsgDmProps[]>([]);
  const [msg, setMsg] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [roomNo, setRoomNo] = useState<number>();
  const { me } = userStore();

  // let socket: any = undefined;
  // export interface MsgProps {
  //   username: string;
  //   text: string;
  // }

  // useEffect(() => {
  //   setMsgList([
  //     { username: me.name, text: 'hello' },
  //     { username: 'tmp', text: 'world!' },
  //     { username: me.name, text: 'hello' },
  //     { username: 'tmp', text: 'world!' },
  //     { username: me.name, text: 'hello' },
  //     { username: 'tmp', text: 'world!' },
  //     { username: me.name, text: 'hello' },
  //     { username: 'tmp', text: 'world!' },
  //     { username: me.name, text: 'hello' },
  //     { username: 'tmp', text: 'world!' },
  //     { username: me.name, text: 'hello' },
  //     { username: 'tmp', text: 'world!' },
  //     { username: me.name, text: 'hello' },
  //     { username: 'tmp', text: 'world!' },
  //     { username: me.name, text: 'hello' },
  //     { username: 'tmp', text: 'world!' },
  //     { username: me.name, text: 'hello' },
  //     { username: 'tmp', text: 'world!' },
  //     { username: me.name, text: 'hello' },
  //     { username: 'tmp', text: 'world!' },
  //     { username: me.name, text: 'hello' },
  //     { username: 'tmp', text: 'world!' },
  //     { username: me.name, text: 'hello' },
  //     { username: 'tmp', text: 'world!' },
  //   ]);
  // }, []);

  function handleSendButtonClicked() {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    console.log(msg);
    setMsg('');
    if (inputRef.current !== null) inputRef.current.focus();
    socket.emit('directMessage', { chatRoomId: roomNo, message: msg });
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
      socket.emit('directMessage', { chatRoomId: roomNo, message: msg });
    }
  }

  async function makeS() {
    makeSocket();
  }

  // function checkRoomExist() {
  //   socket?.once('chatRoomAll', (res) => {
  //     const allChatRoom = res.chatRoom;
  //     let roomBool = false;
  //     allChatRoom.forEach((chatRoom: any)=>{
  //       if (chatRoom.)
  //     })
  //   });
  // }

  const { socket, makeSocket } = chatStore();
  async function dmStart() {
    if (socket === undefined) {
      await makeS();
    }
    // checkRoomExist();
    // if (socket === undefined) {
    //   console.log('socket is UD dmStart', socket);
    //   return;
    // }
    socket?.emit('createChatRoomDm', {
      targetId: user.id,
    });
    socket?.once('createChatRoomDm', (res) => {
      console.log(res);
      setRoomNo(res.chatRoomDm.id);
    });
    socket?.on('chatRoomDmById', async (res) => {
      console.log(res);
    });
    socket?.on('joinDm', (res) => {
      console.log(res);
      socket.emit('chatRoomDmById', { chatRoomId: roomNo });
    });
    socket?.on('leaveDm', async (res) => {
      console.log(res.message);
      socket.emit('chatRoomDmById', { chatRoomId: roomNo });
    });
    socket?.on('directMessage', (res) => {
      setMsgList((prev) => {
        return [
          ...prev,
          {
            username: res.user.username,
            targetname: res.targetUser.user.username,
            text: res.message,
          },
        ];
      });
    });
    console.log('popover open -> DM START');
  }
  async function dmOver() {
    if (socket === undefined) {
      console.log('socket is UD dmOver');
      return;
    }
    socket.emit('leaveDm', { targetUserId: me.id, chatRoomId: roomNo });
    socket.off('chatRoomDmById');
    socket.off('joinDm');
    socket.off('leaveDm');
    console.log('popover close -> DM DONE');
  }

  return (
    //FIXME: placement가 하단에 고정될 수는 없을까?
    <Popover
      placement="left"
      onOpen={() => {
        console.log('DMTARGET : ', user.id, user.name);
        dmStart();
      }}
      onClose={() => {
        dmOver();
      }}
    >
      <PopoverTrigger>
        <Box>
          <RawUserItem user={user} msgNum={msgNum} />
        </Box>
      </PopoverTrigger>
      <Portal>
        <PopoverContent
          borderRadius="20"
          width={'40vw'}
          style={{ position: 'relative', right: '5%' }}
        >
          <PopoverCloseButton w={'8%'} h={'8%'} mt={'2%'}>
            <Image src="/close.svg" />
          </PopoverCloseButton>
          <PopoverHeader borderTopRadius="20" p="3" bg="main" color="white">
            <HStack spacing="5">
              <CustomAvatar url={user.imgUrl} size="md" status={user.status} />
              <Text fontSize="xl">{user.name.toUpperCase()}</Text>
            </HStack>
          </PopoverHeader>
          <PopoverBody>
            <VStack p={5} w="full" height={'40vh'} mt={10} bg="white" overflow="scroll">
              <>
                {msgList.map((msg, idx) =>
                  msg.username === me.name && msg.targetname === user.name ? (
                    <Flex key={idx} width="100%">
                      <Spacer />
                      <Flex p={3} borderRadius="20px" bg={'main'} color={'white'} fontSize="2xl">
                        {msg.text}
                      </Flex>
                    </Flex>
                  ) : msg.username === user.name && msg.targetname === me.name ? (
                    <Flex key={idx} width="100%">
                      <Flex p={3} borderRadius="20px" bg="gray.200" color="black" fontSize="2xl">
                        {msg.text}
                      </Flex>
                      <Spacer />
                    </Flex>
                  ) : null
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
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}

export default function ContextMenuHoc({ user, msgNum }: RawUserItemProps) {
  return (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <OptionMenu user={user} isFriend={true} isBlocked={false} />}
    >
      {(ref) => (
        <Box ref={ref} w="100%" position="relative" px={3} py={1}>
          <PopoverHoc user={user} msgNum={msgNum} />
        </Box>
      )}
    </ContextMenu>
  );
}
