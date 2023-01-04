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
} from '@chakra-ui/react';
import { ContextMenu } from 'chakra-ui-contextmenu';
import CustomAvatar from './CustomAvatar';
import { OptionMenu } from './OptionMenu';
import RawUserItemProps from '@/interfaces/RawUserItemProps';
import RawUserItem from './RawUserItem';
import { useEffect, useRef, useState } from 'react';
import { MsgProps } from '@/interfaces/MsgProps';
import { userStore } from '@/stores/userStore';

function PopoverHoc({ user, msgNum }: RawUserItemProps) {
  const [msgList, setMsgList] = useState<MsgProps[]>([]);
  const [msg, setMsg] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [roomNo, setRoomNo] = useState<number>();
  const { me } = userStore();

  let socket: any = undefined;
  // export interface MsgProps {
  //   username: string;
  //   text: string;
  // }

  useEffect(() => {
    setMsgList([
      { username: me.name, text: 'hello' },
      { username: 'tmp', text: 'world!' },
      { username: me.name, text: 'hello' },
      { username: 'tmp', text: 'world!' },
      { username: me.name, text: 'hello' },
      { username: 'tmp', text: 'world!' },
      { username: me.name, text: 'hello' },
      { username: 'tmp', text: 'world!' },
      { username: me.name, text: 'hello' },
      { username: 'tmp', text: 'world!' },
      { username: me.name, text: 'hello' },
      { username: 'tmp', text: 'world!' },
      { username: me.name, text: 'hello' },
      { username: 'tmp', text: 'world!' },
      { username: me.name, text: 'hello' },
      { username: 'tmp', text: 'world!' },
      { username: me.name, text: 'hello' },
      { username: 'tmp', text: 'world!' },
      { username: me.name, text: 'hello' },
      { username: 'tmp', text: 'world!' },
      { username: me.name, text: 'hello' },
      { username: 'tmp', text: 'world!' },
      { username: me.name, text: 'hello' },
      { username: 'tmp', text: 'world!' },
    ]);
  }, []);

  function handleSendButtonClicked() {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    console.log(msg);
    setMsg('');
    if (inputRef.current !== null) inputRef.current.focus();
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
      socket.emit('message', { chatRoomId: roomNo, message: msg });
    }
  }

  return (
    //FIXME: placement가 하단에 고정될 수는 없을까?
    <Popover placement="left">
      <PopoverTrigger>
        <Box>
          <RawUserItem user={user} msgNum={msgNum} />
        </Box>
      </PopoverTrigger>
      <Portal>
        <PopoverContent borderRadius="20" width={'40vw'}>
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
