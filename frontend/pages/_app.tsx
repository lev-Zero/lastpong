import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ReactElement, ReactNode, useEffect } from 'react';
import theme from './theme';
import '/styles/global.css';
import {
  Button,
  Center,
  ChakraProvider,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack,
  Text,
  Box,
  HStack,
  Link,
} from '@chakra-ui/react';
import { CustomButton } from '@/components/CustomButton';
import CustomAvatar from '@/components/CustomAvatar';
import { UserProps, UserStatus } from '@/interfaces/UserProps';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function InviteModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const invitingDummyUser: UserProps = {
    id: 1,
    name: 'yopark',
    imgUrl: '',
    status: UserStatus.INGAME,
    rating: 1028,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="win" color="white" borderRadius={30}>
        <Center>
          <VStack>
            <ModalBody>
              <VStack>
                <Flex w="100%" justifyContent="space-around" alignItems="center" bg="Win">
                  <Box mr={5}>
                    <CustomAvatar
                      url={invitingDummyUser.imgUrl}
                      size="xl"
                      status={invitingDummyUser.status}
                    />
                  </Box>
                  <VStack>
                    <Text fontSize="4xl">{invitingDummyUser.name.toUpperCase()}</Text>
                    <HStack>
                      <Text>RATING</Text>
                      <Text color={'opponent'}>{invitingDummyUser.rating}</Text>
                    </HStack>
                  </VStack>
                </Flex>
                <Text fontSize="300%">INVITED YOU</Text>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <VStack mb={'7'}>
                {/* TODO:onclick 핸들러로 매치 잡는 기능 */}
                <CustomButton size="lg" onClick={onClose}>
                  MATCH
                </CustomButton>
                <CustomButton
                  size="lg"
                  onClick={onClose}
                  btnStyle={{
                    background: 'transparent',
                  }}
                >
                  CANCEL
                </CustomButton>
              </VStack>
            </ModalFooter>
          </VStack>
        </Center>
      </ModalContent>
    </Modal>
  );
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <ChakraProvider theme={theme}>
      {getLayout(<Component {...pageProps} />)}
      <InviteModal />
    </ChakraProvider>
  );
}
