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
  useDisclosure,
} from '@chakra-ui/react';
import { ContextMenu } from 'chakra-ui-contextmenu';
import CustomAvatar from './CustomAvatar';
import CustomAlert from './CustomAlert';
import { OptionMenu } from './OptionMenu';
import RawUserItemProps from '@/interfaces/RawUserItemProps';
import RawUserItem from './RawUserItem';
import { useEffect, useRef, useState } from 'react';
import { userStore } from '@/stores/userStore';
import { chatStore } from '@/stores/chatStore';
import { customFetch } from '@/utils/customFetch';
import Swal from 'sweetalert2';
import { UserStatus } from '@/interfaces/UserProps';

function PopoverHoc({ user, msgNum }: RawUserItemProps) {
  const { dmMsgList, dmIdxMap, updateDmIdxMap } = chatStore();
  const [msg, setMsg] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dmRoomNo, setDmRoomNo] = useState<number>();
  const [isMyFriend, setIsMyFriend] = useState<boolean>(false);
  const { me, friends } = userStore();
  const { socket } = chatStore();
  const [msgCount, setMsgCount] = useState<number>(0);
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const messageBoxRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();

    let tmpIdx = dmIdxMap.get(user.name);
    if (tmpIdx === undefined || tmpIdx === null) {
      updateDmIdxMap(user.name, -1);
      tmpIdx = -1;
    }
    dmMsgList.forEach((msg, idx) => {
      if (idx > tmpIdx! && msg.username === user.name && msg.targetUsername === me.name) {
        if (!isOpened) {
          setMsgCount((prev) => prev + 1);
        }
        updateDmIdxMap(user.name, idx);
      }
    });
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
            console.log(`유저 둘 사이에 ${chatRoomDm.id}번 DM 방이 만들어져 있습니다`);
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

  async function checkDmOk(): Promise<boolean> {
    //userStore friends: userProps[] -> 상대 아이디 있나 확인해서  id 로 저장
    const tmp = friends.find((friend) => friend.id === user.id);
    // console.log('!!tmp', tmp);
    if (!tmp) return false;
    const json = await customFetch('GET', `user/friend/id/${tmp.id}`);
    // console.log('!!json', json);
    const res = json.find((friend: any) => {
      // console.log('friend id ', friend.friend.id);
      // console.log('me id ', me.id);
      // console.log('result ', friend.id === me.id);

      return friend.friend.id === me.id;
    });
    // console.log('final res', res);
    if (res === null || res === undefined) return false;

    //localhost:3000/user/id/5    -> freinds response 받을 수있음

    return true;
  }

  function getCheckDmPromiseBoolean() {
    checkDmOk().then((res) => {
      // console.log('getCheckDmPromiseBoolean', res);
      if (res === true) {
        setIsMyFriend(true);
      } else {
        setIsMyFriend(false);
      }
    });
  }

  function noFriendAlert(isMyFriend: boolean, userStatus: UserStatus) {
    if (!isMyFriend) {
      Swal.fire({
        backdrop: `    rgba(0,0,123)
        url("/nyan-cat-4k.gif")
        left top
        repeat
        
      `,
        title: '찐친이 아닙니다',
        text: '서로 친구여야 DM을 보낼 수 있습니다.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: '슬프다',
      }).then((result) => {
        if (result.isConfirmed) {
          // Swal.fire(
          //   '친구 추가 하는법',
          //   '친구 검색후 프로필에서 ADD FRIEND' + `\n` + '직접 가서 알려주세요!!',
          //   //FIXME: 줄바꿈 왜안될까
          //   'info'
          // );

          Swal.fire({
            backdrop: `    rgba(0,0,123)
            url("/nyan-cat-4k.gif")
            left top
            repeat
            
          `,
            title: '친구 추가 하는법',
            text: '친구 검색후 프로필에서 ADD FRIEND' + `\n` + '직접 가서 알려주세요!!',
            icon: 'info',
          });
        }
      });
    } else if (userStatus === UserStatus.INGAME) {
      Swal.fire({
        backdrop: `    rgba(0,0,123)
        url("/nyan-cat-4k.gif")
        left top
        repeat
        
      `,
        title: '친구가 게임중입니다.',
        text: '게임중 일때는 DM을 보낼 수 없습니다.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: '확인',
      });
    } else {
      Swal.fire({
        backdrop: `    rgba(0,0,123)
        url("/nyan-cat-4k.gif")
        left top
        repeat
        
      `,
        title: '친구가 오프라인 입니다.',
        text: '온라인 유저에게만 DM을 보낼 수 있습니다.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: '확인',
      });
    }
  }

  useEffect(() => {
    getCheckDmPromiseBoolean();
  }, [friends]);

  return (
    <>
      <Popover
        placement="left"
        onOpen={() => {
          getDmRoomNo();
          setIsOpened(true);
          if (inputRef !== null) inputRef.current?.focus();
        }}
        onClose={() => {
          setMsg('');
          setIsOpened(false);
        }}
      >
        <Box onClick={getCheckDmPromiseBoolean}>
          {isMyFriend && user.status === UserStatus.ONLINE ? (
            <PopoverTrigger>
              <Box>
                <RawUserItem user={user} msgNum={msgCount} />
              </Box>
            </PopoverTrigger>
          ) : (
            <Box
              onClick={() => {
                noFriendAlert(isMyFriend, user.status);
              }}
            >
              <RawUserItem user={user} msgNum={msgCount} />
            </Box>
          )}
        </Box>
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
    </>
  );
}

export default function ContextMenuHoc({ user, msgNum }: RawUserItemProps) {
  const { friends } = userStore();
  const [isFriend, setIsFriend] = useState<boolean>();

  useEffect(() => {
    setIsFriend(friends.some((friend) => friend.id === user.id));
  }, []);

  return (
    <>
      {isFriend === undefined ? (
        <Box w="100%" position="relative" px={3} py={1}>
          <PopoverHoc user={user} msgNum={msgNum} />
        </Box>
      ) : (
        <ContextMenu<HTMLDivElement>
          renderMenu={() => <OptionMenu user={user} isFriend={isFriend} />}
        >
          {(ref) => (
            <Box
              ref={ref}
              w="100%"
              position="relative"
              px={3}
              py={1}
              _hover={{
                background: 'white',
                color: 'teal.500',
              }}
              _active={{
                background: 'white',
                color: 'blue.500',
              }}
            >
              <PopoverHoc user={user} msgNum={msgNum} />
            </Box>
          )}
        </ContextMenu>
      )}
    </>
  );
}
