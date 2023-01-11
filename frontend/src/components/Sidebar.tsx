import { UserProps } from '@/interfaces/UserProps';
import { userStore } from '@/stores/userStore';
import {
  VStack,
  Text,
  Flex,
  Spacer,
  Box,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Image,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Link,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import UserItem from './UserItem';
import RawUserItem from './RawUserItem';
import { allUserStore } from '@/stores/allUserStore';
import { chatStore } from '@/stores/chatStore';
import { DmMsgProps } from '@/interfaces/MsgProps';

export default function Sidebar() {
  const { friends, fetchFriends, fetchBlockedUsers } = userStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchId, setSearchId] = useState<string>('');
  const { allUsers, getAllUsers } = allUserStore();
  const [allUsersExceptMe, setAllUsersExceptMe] = useState<UserProps[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { dmMsgList, addDmMsg } = chatStore();

  const { socket, makeSocket } = chatStore();

  useEffect(() => {
    if (socket === undefined) {
      makeSocket();
    }
  }, []);

  useEffect(() => {
    if (socket === undefined || !socket.connected) {
      return;
    }
    socket.on('join', console.log);
    socket.on('directMessage', ({ user, targetUser, message }) => {
      addDmMsg(user.username, targetUser.user.username, message);
    });

    return () => {
      socket.off('join');
      socket.off('directMessage');
    };
  }, [socket?.connected]);

  useEffect(() => {
    console.log(dmMsgList);
  }, [dmMsgList]);

  useEffect(() => {
    fetchFriends();
    fetchBlockedUsers();
  }, []);
  const { me } = userStore();

  function searchKeySubmit(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === 'Enter') {
      console.log(searchId);
      setSearchId('');
    }
  }

  function seerchSubmit() {
    console.log(searchId);
    setSearchId('');
    if (searchInputRef.current !== null) searchInputRef.current.focus();
  }

  //fetch localhost:3000/user get ALL USERS
  //전체 유저를 불러 온 후 나는 제외 하고 띄워 야함
  async function getAllUsersExceptMe() {
    try {
      setAllUsersExceptMe(await getAllUsers());
      setAllUsersExceptMe((prev: UserProps[]) => {
        return prev.filter((user) => {
          // console.log(user.name, me.name, user.name !== me.name);
          return user.name !== me.name;
        });
      });
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
        return;
      }
    }
  }
  return (
    <>
      <VStack
        w="100%"
        h="95%"
        padding={5}
        backgroundColor="white"
        borderRadius={'20px'}
        mt={'30px'}
        marginBottom={'100'}
      >
        <Flex w="100%">
          <Text ml={'15px'} fontSize={30}>
            FRIENDS
          </Text>
          <Spacer />
          <Image
            src="/AddFriend.svg"
            w={10}
            h={10}
            p={1}
            mt={1}
            borderRadius={7}
            bg="main"
            alt="add friend"
            onClick={() => {
              onOpen();
              getAllUsersExceptMe();
            }}
            mr={'5px'}
          />
        </Flex>
        <VStack w="100%" overflowY="scroll">
          {friends.map((friend, index) => (
            // TODO: message Stack
            <UserItem key={index} user={friend} msgNum={0} />
          ))}
        </VStack>
      </VStack>
      {/* modal part */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalContent
          bg="white"
          color="black"
          left={'5%'}
          maxWidth={'40vw'}
          h={'50vh'}
          borderRadius={'30px'}
          overflow={'hidden'}
          border={'1px'}
        >
          <ModalHeader bg="main" borderBottom={'1px'}>
            <HStack>
              <Flex h={'80px'} p={'10px'}>
                <InputGroup>
                  <InputLeftElement>
                    <Image
                      style={{
                        position: 'absolute',
                        top: '85%',
                        left: '160%',
                        transform: 'translate(-50%, -50%)',
                      }}
                      src="/SearchGlass.svg"
                      alt="search icon"
                      color={'black'}
                      onClick={seerchSubmit}
                    />
                  </InputLeftElement>
                  <Input
                    bg={'white'}
                    left={'30px'}
                    width={'33vw'}
                    h={'100%'}
                    paddingLeft={'65px'}
                    fontSize={'30'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setSearchId(e.target.value);
                    }}
                    onKeyDown={searchKeySubmit}
                    value={searchId}
                    autoFocus
                    ref={searchInputRef}
                  />
                </InputGroup>
              </Flex>
              <Spacer />
              <Flex paddingRight={'10px'}>
                <Image
                  w={'40px'}
                  h={'40px'}
                  src="/Close.svg"
                  alt="close button"
                  onClick={onClose}
                />
              </Flex>
            </HStack>
          </ModalHeader>
          <ModalBody overflow={'scroll'}>
            <Box overflowY="scroll" mb={10}>
              <SimpleGrid columns={2} spacing={1}>
                {searchId
                  ? allUsersExceptMe
                      .filter((user) => {
                        const regex = new RegExp(searchId, 'i');
                        return user.name.match(regex);
                      })
                      .map((user, index) => (
                        <Link key={index} href={`/user/${user.name}`}>
                          <RawUserItem user={user} />
                        </Link>
                      ))
                  : allUsersExceptMe.map((user, index) => (
                      <Link key={index} href={`/user/${user.name}`}>
                        <RawUserItem user={user} />
                      </Link>
                    ))}
              </SimpleGrid>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
