import React from 'react';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { ReactElement } from 'react';
import { Flex, HStack, Image, PinInput, PinInputField, Spinner, VStack } from '@chakra-ui/react';
import BasicLayout from '@/layouts/BasicLayout';
import { useRouter } from 'next/router';
import { customFetch } from '@/utils/customFetch';
import { removeCookie, setCookie } from 'typescript-cookie';

export default function OtpPage() {
  const [qrCodeSrc, setQrCodeSrc] = useState<string>();
  const [isWrongColor, setIsWrongColor] = useState<boolean>(false);
  const [isRerender, setIsRerender] = useState<boolean>(false);
  const router = useRouter();

  async function verifyOtpCode(code: string) {
    customFetch('POST', '/auth/login/otp', { code })
      .then((json) => {
        if (json.status === 400) {
          console.log(json.response);
          setIsWrongColor(true);
          setTimeout(() => setIsWrongColor(false), 500);
          setIsRerender(true);
          return;
        }
        removeCookie('accessToken');
        setCookie('accessToken', json.token);
        router.push('/');
      })
      .catch(console.log);
  }

  // FIXME: code 초기화, autofocus를 동시에 해결하기 위해 리렌더를 해버렸다.
  useEffect(() => {
    setIsRerender(false);
  }, [isRerender]);

  useEffect(() => {
    customFetch('GET', '/auth/login/otp/check').then((json) => {
      // otp off인 유저
      if ('status' in json) {
        router.push('/');
        return;
      }
      setQrCodeSrc(json.qrcode);
    });
  }, []);

  return (
    <>
      <Head>
        <title>LastPong</title>
        <meta name="description" content="ft_transcendence project in 42 Seoul" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {qrCodeSrc === undefined ? (
        <Spinner />
      ) : (
        <Flex
          border="2px"
          p="20"
          borderRadius="20%"
          borderColor={!isWrongColor ? 'black' : 'red'}
          bg={!isWrongColor ? 'transparent' : 'red'}
        >
          <VStack>
            <Image border="2px" width="300px" height="300px" borderColor="black" src={qrCodeSrc} />
            <HStack p={10}>
              {isRerender ? null : (
                <PinInput otp onComplete={verifyOtpCode} size="lg">
                  <PinInputField bg="white" color="black" autoFocus />
                  <PinInputField bg="white" color="black" />
                  <PinInputField bg="white" color="black" />
                  <PinInputField bg="white" color="black" />
                  <PinInputField bg="white" color="black" />
                  <PinInputField bg="white" color="black" />
                </PinInput>
              )}
            </HStack>
          </VStack>
        </Flex>
      )}
    </>
  );
}

OtpPage.getLayout = function (page: ReactElement) {
  return <BasicLayout>{page}</BasicLayout>;
};
