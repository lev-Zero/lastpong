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
import { userStore } from '@/stores/userStore';
import { chatStore } from '@/stores/chatStore';
import { MsgProps } from '@/interfaces/MsgProps';

function PopoverHoc({ user, msgNum }: RawUserItemProps) {
  const { dmMsgList } = chatStore();
  const [msg, setMsg] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dmRoomNo, setDmRoomNo] = useState<number>();
  const { me } = userStore();
  const { socket } = chatStore();
  const [msgCount, setMsgCount] = useState<number>(0);
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [lastIdx, setLastIdx] = useState<number>(-1);
  const messageBoxRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
    if (!isOpened) {
      dmMsgList.forEach((msg, idx) => {
        if (idx > lastIdx && msg.username === user.name && msg.targetUsername === me.name) {
          setMsgCount((prev) => {
            return prev + 1;
          });
          setLastIdx(idx);
        }
      });
    }
  }, [dmMsgList]);

  function getDmRoomNo() {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    socket.emit('chatRoomDmMe');
    socket.once('chatRoomDmMe', ({ chatRoomDm }) => {
      chatRoomDm.forEach(({ id }: any) => {
        socket.emit('chatRoomDmById', { chatRoomId: id });
        socket.once('chatRoomDmById', ({ chatRoomDm }) => {
          const joinedDmUsers = chatRoomDm.joinedDmUser;
          if (joinedDmUsers.some(({ user: opp }: any) => opp.id === user.id)) {
            setDmRoomNo(chatRoomDm.id);
          }
        });
      });
    });
    setMsgCount(0);
  }

  function submitDm() {
    if (socket === undefined) {
      console.log('socket is undefined');
      return;
    }
    if (dmRoomNo === undefined) {
      socket.emit('createChatRoomDm', { targetId: user.id });
      socket.once('createChatRoomDm', ({ chatRoomDm, message }) => {
        console.log(message);
        const newDmRoomNo = chatRoomDm.id;
        setDmRoomNo(newDmRoomNo);

        // newDmRoomNo를 이용하여 보내기
        socket.emit('directMessage', { chatRoomId: newDmRoomNo, message: msg });
      });
      return;
    }
    // dmRoomNo를 이용하여 보내기
    socket.emit('directMessage', { chatRoomId: dmRoomNo, message: msg });
  }

  function handleSendButtonClicked() {
    submitDm();
    setMsg('');
    if (inputRef.current !== null) {
      inputRef.current.focus();
    }
  }

  function handleEnterKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key !== 'Enter') {
      return;
    }
    if (e.nativeEvent.isComposing) {
      return;
    }
    submitDm();
    setMsg('');
  }

  function makeDmList() {
    let arr: any = [];

    dmMsgList.map((msg, idx) =>
      msg.username === me.name && msg.targetUsername === user.name
        ? arr.push(
            <Flex key={idx} width="100%">
              <Spacer />
              <Flex p={3} borderRadius="20px" bg={'main'} color={'white'} fontSize="2xl">
                {msg.text}
              </Flex>
            </Flex>
          )
        : msg.username === user.name && msg.targetUsername === me.name
        ? arr.push(
            <Flex key={idx} width="100%">
              <Flex p={3} borderRadius="20px" bg="gray.200" color="black" fontSize="2xl">
                {msg.text}
              </Flex>
              <Spacer />
            </Flex>
          )
        : null
    );

    return arr;
  }

  return (
    //FIXME: placement가 하단에 고정될 수는 없을까?
    <Popover
      placement="left"
      onOpen={() => {
        getDmRoomNo();
        setIsOpened(true);
      }}
      onClose={() => {
        setMsg('');
        setIsOpened(false);
      }}
    >
      <PopoverTrigger>
        <Box>
          <RawUserItem user={user} msgNum={msgCount} />
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
            <VStack
              p={5}
              w="full"
              height={'40vh'}
              mt={10}
              bg="white"
              overflow="scroll"
              ref={messageBoxRef}
            >
              <>{makeDmList()}</>
            </VStack>
            <Spacer />
            <HStack w="full" p={5}>
              <Input
                pl="20px"
                mr="20px"
                h="60px"
                borderRadius="20px"
                bg="gray.100"
                fontSize="xl"
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
  const { friends } = userStore();
  const [isFriend, setIsFriend] = useState<boolean>();
  const [isBlocked, setIsBlocked] = useState<boolean>(false); // TODO: 추후 로직 추가

  useEffect(() => {
    setIsFriend(friends.some((friend) => friend.id === user.id));
  }, []);

  return (
    <>
      {isFriend === undefined || isBlocked === undefined ? (
        <Box w="100%" position="relative" px={3} py={1}>
          <PopoverHoc user={user} msgNum={msgNum} />
        </Box>
      ) : (
        <ContextMenu<HTMLDivElement>
          renderMenu={() => <OptionMenu user={user} isFriend={isFriend} isBlocked={isBlocked} />}
        >
          {(ref) => (
            <Box ref={ref} w="100%" position="relative" px={3} py={1}>
              <PopoverHoc user={user} msgNum={msgNum} />
            </Box>
          )}
        </ContextMenu>
      )}
    </>
  );
}
