import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { ReactElement } from 'react';
import { CustomButton } from '@/components/CustomButton';
import { Text, VStack } from '@chakra-ui/react';
import BasicLayout from '@/layouts/BasicLayout';
import { SERVER_URL } from '@/utils/variables';
import { useRouter } from 'next/router';
import { customFetch } from '@/utils/customFetch';

export default function LandingPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(false);

  const goToLogin = () => {
    router.push(`${SERVER_URL}/auth`);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const json = await customFetch('GET', '/user/me');
        // user 정보 zustand에 저장하기
        setIsLogin(true);
      } catch (e) {
        setIsLogin(false);
      } finally {
        setIsLoaded(true);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    if (isLogin) {
      router.push('/home');
    }
  }, [isLoaded]);

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
          </VStack>
        </>
      )}
    </>
  );
}

LandingPage.getLayout = function (page: ReactElement) {
  return <BasicLayout>{page}</BasicLayout>;
};
