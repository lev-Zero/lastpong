import { UserProps, UserStatus } from '@/interfaces/UserProps';
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
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import UserItem from './UserItem';
import { CustomButton } from './CustomButton';
import { customFetch } from '@/utils/customFetch';
import { convertUserStatus } from '@/utils/convertUserStatus';

export default function Sidebar() {
  const { friends, fetchFriends } = userStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchId, setSearchId] = useState<string>('');
  const [allUsers, setAllUsers] = useState<UserProps[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => fetchFriends, []);

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
  async function getAllUser() {
    let users = await customFetch('GET', '/user');
    let userList: UserProps[] = users.map((json: any): UserProps => {
      console.log(json);
      return {
        name: json.username,
        imgUrl: '',
        status: convertUserStatus(json.status),
        rating: json.rating,
        useOtp: false,
      };
    });

    //const [allUsers, setAllUsers] = useState<UserProps[]>([]);
    console.log('userList : ', userList);
    setAllUsers(userList);
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
              getAllUser();
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
          <ModalBody>
            <Box overflowY="scroll" mb={10}>
              <SimpleGrid columns={2} spacing={1}>
                {searchId
                  ? allUsers
                      .filter((user) => {
                        const regex = new RegExp(searchId, 'i');
                        return user.name.match(regex);
                      })
                      .map((user, index) => <UserItem key={index} user={user} />)
                  : allUsers.map((user, index) => <UserItem key={index} user={user} />)}
              </SimpleGrid>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
