import { UserProps, UserStatus } from '@/interfaces/UserProps';
import { userStore } from '@/stores/userStore';
import {
  VStack,
  Text,
  Flex,
  Spacer,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  Center,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Image,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import UserItem from './UserItem';
import { CustomButton } from './CustomButton';

export default function Sidebar() {
  const { friends, fetchFriends } = userStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [serchId, setSearchId] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => fetchFriends, []);

  function searchKeySubmit(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === 'Enter') {
      console.log(serchId);
      setSearchId('');
    }
  }

  function seerchSubmit() {
    console.log(serchId);
    setSearchId('');
    if (searchInputRef.current !== null) searchInputRef.current.focus();
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
          <Text fontSize={30}>FRIENDS</Text>
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
            onClick={onOpen}
          />
        </Flex>
        <VStack w="100%" overflowY="scroll">
          {friends.map((friend, index) => (
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
                    value={serchId}
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
        </ModalContent>
      </Modal>
    </>
  );
}

{
  /* <VStack>
              {/* <ModalHeader>LOOKING FOR AN OPPONENT...</ModalHeader>
              <ModalBody fontSize="6xl">{timeSpent}</ModalBody>
              <ModalFooter>
                <CustomButton size="md" onClick={onClose}>
                  CANCEL
                </CustomButton>
              </ModalFooter> */
}
