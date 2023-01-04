import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { ReactElement } from 'react';
import { CustomButton } from '@/components/CustomButton';
import { Spacer, Text, VStack } from '@chakra-ui/react';
import BasicLayout from '@/layouts/BasicLayout';
import { SERVER_URL } from '@/utils/variables';
import { useRouter } from 'next/router';
import { userStore } from '@/stores/userStore';

export default function LandingPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [isFirstLogin, setIsFirstLogin] = useState<boolean>(false);

  const goToLogin = () => {
    router.push(`${SERVER_URL}/auth`);
  };

  const { me, fetchMe } = userStore();

  useEffect(() => {
    async function fetchData() {
      try {
        await fetchMe();
        if (me.name === ' ') {
          return;
        }
        if (me.name === '') {
          setIsFirstLogin(true);
        }
        setIsLogin(true);
        setIsLoaded(true);
      } catch (e) {
        console.log(e);
        setIsLogin(false);
        setIsLoaded(true);
      }
    }
    fetchData();
  }, [me]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    if (isFirstLogin) {
      router.push('/auth/basic/id');
    } else if (isLogin) {
      router.push('/home');
    }
  }, [isLogin, isFirstLogin, isLoaded]);

  function goToFakeLogin() {
    router.push('/fakeLogin');
  }
  return (
    <>
      <Head>
        <title>LastPong</title>
        <meta name="description" content="ft_transcendence project in 42 Seoul" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!isLoaded || isLogin ? (
        <Text fontSize="6xl">LOADING...</Text>
      ) : (
        <>
          <VStack spacing={10}>
            <Text fontSize="6xl">LASTPONG</Text>
            <CustomButton size="lg" onClick={goToLogin}>
              START
            </CustomButton>
            <Spacer />
            <Text fontSize={30}>FAKE LOGIN</Text>
            <CustomButton size="lg" onClick={goToFakeLogin}>
              GO
            </CustomButton>
          </VStack>
        </>
      )}
    </>
  );
}

LandingPage.getLayout = function (page: ReactElement) {
  return <BasicLayout>{page}</BasicLayout>;
};
