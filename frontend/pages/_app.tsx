import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ReactElement, ReactNode } from 'react';
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
import { SERVER_URL } from '@/utils/variables';
import { CustomButton } from '@/components/CustomButton';
import CustomAvatar from '@/components/CustomAvatar';
import { UserProps, UserStatus } from '@/interfaces/UserProps';
import { useRouter } from 'next/router';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const getLayout = Component.getLayout ?? ((page) => page);
  const user: UserProps = {
    name: 'yopark',
    imgUrl: '',
    // status: UserStatus.inGame,
    rating: 1028,
    useOtp: false,
  };

  return (
    <ChakraProvider theme={theme}>
      {getLayout(<Component {...pageProps} />)}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="win" color="white" borderRadius={30}>
          <Center>
            <VStack>
              <ModalHeader></ModalHeader>
              <ModalBody>
                <VStack>
                  <Flex w="100%" justifyContent="space-around" alignItems="center" bg="Win">
                    <Box mr={5}>
                      <CustomAvatar url={user.imgUrl} size="xl" status={user.status} />
                    </Box>
                    <VStack>
                      <Text fontSize="4xl">{user.name.toUpperCase()}</Text>
                      <HStack>
                        <Text>RATING</Text>
                        <Text color={'opponent'}>{user.rating}</Text>
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
      {/* <Button onClick={onOpen}>Invited</Button> */}
    </ChakraProvider>
  );
}
