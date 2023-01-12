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

  const [isReadyToLoad, setIsReadyToLoad] = useState<boolean>(false);
  const { me, fetchMe } = userStore();

  function goToLogin() {
    router.push(`${SERVER_URL}/auth`);
  }

  function goToFakeLogin() {
    router.push('/fakeLogin');
  }

  useEffect(() => {
    async function f() {
      fetchMe().catch(() => setIsReadyToLoad(true));
    }
    f();
  }, []);

  useEffect(() => {
    if (me.id === 0) {
      return;
    }
    let mounted: boolean = false; // React.StrictMode 두번 렌더링으로 인한 router.push 중복 발생 문제 해결방법
    router.push(me.name === '' ? '/auth/basic/id' : '/home');
    return () => {
      mounted = false;
    };
  }, [me]);

  return (
    <>
      <Head>
        <title>LastPong</title>
        <meta name="description" content="ft_transcendence project in 42 Seoul" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!isReadyToLoad ? (
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
