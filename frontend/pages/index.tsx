import MainLayout from '@/layouts/MainLayout';
import Head from 'next/head';
import { ReactElement, useEffect, useState } from 'react';
import {
  Center,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { CustomButton } from '@/components/CustomButton';
import { SERVER_URL } from '@/variables';
import { useRouter } from 'next/router';

export default function LandingPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [timeSpent, setTimeSpent] = useState<number>(1);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const cookies = Object.fromEntries(
      document.cookie.split(';').map((cookie) => cookie.trim().split('='))
    );

    const jwtToken: string = `Bearer ${cookies['accessToken']}`;
    const headers = {
      Authorization: jwtToken,
      'Content-Type': 'application/json',
    };
    fetch(SERVER_URL + '/user/me', { headers })
      .then((res) => {
        if (!res.ok) {
          setIsLogin(false);
          setIsLoaded(true);
        }
        return res.json();
      })
      .then((json) => {
        setIsLogin(true);
        setIsLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    if (!isLogin) {
      router.push('/auth/login');
    }
  }, [isLoaded]);

  useEffect(() => {
    const interval = setInterval(() => setTimeSpent((cur) => cur + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeSpent(1);
    }
  }, [isOpen]);

  return (
    <>
      {!isLoaded ? (
        <Text>LOADING...</Text>
      ) : (
        <>
          <Head>
            <title>LastPong</title>
            <meta name="description" content="ft_transcendence project in 42 Seoul" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Flex height={'100%'} flexDir={'column'} alignItems="center" justifyContent={'center'}>
            <Image src="/HowToPlay.png" height="90%" alt="How To Play LastPong" />
            <CustomButton
              size="lg"
              onClick={onOpen}
              btnStyle={{
                position: 'absolute',
                top: '82%',
                left: '42%',
                transform: 'translate(-50%, -50%)',
                height: '10%',
                width: '10%',
                fontSize: '40px',
              }}
            >
              MATCH
            </CustomButton>
          </Flex>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent bg="main" color="white">
              <Center>
                <VStack>
                  <ModalHeader>LOOKING FOR AN OPPONENT...</ModalHeader>
                  <ModalBody fontSize="6xl">{timeSpent}</ModalBody>
                  <ModalFooter>
                    <CustomButton size="md" onClick={onClose}>
                      CANCEL
                    </CustomButton>
                  </ModalFooter>
                </VStack>
              </Center>
            </ModalContent>
          </Modal>
        </>
      )}
    </>
  );
}

LandingPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
