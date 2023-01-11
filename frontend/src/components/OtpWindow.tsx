import React from 'react';
import { SERVER_URL } from '@/utils/variables';

import { getCookie, setCookie, removeCookie } from 'typescript-cookie';
import {
  Flex,
  Image,
  VStack,
  HStack,
  PinInput,
  PinInputField,
  PinInputDescendantsProvider,
  Input,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { customFetch } from '@/utils/customFetch';

interface OtpWindowProps {
  src: string;
}

export default function OtpWindow({ src }: OtpWindowProps) {
  const [bgColor, setBgColor] = useState<boolean>(true);
  const [reInput, setReInput] = useState<boolean>(true);
  const router = useRouter();

  const refref = useRef();

  async function verifyOtpCode(code: string) {
    try {
      const json = await customFetch('POST', '/auth/login/otp', { code });
      if (json.status === 400) {
        console.log(json.response);
        setBgColor(false);
        setTimeout(() => setBgColor(true), 500);
        setReInput(false);
        return;
      }
      removeCookie('accessToken');
      setCookie('accessToken', json.token);
      router.push('/');
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    setReInput(true);
  }, [reInput]);

  return (
    <Flex
      border={'2px'}
      p={'20'}
      borderRadius={'20%'}
      borderColor={bgColor ? 'black' : 'red'}
      bg={bgColor ? 'transparent' : 'red'}
    >
      <VStack>
        <Image border={'2px'} borderColor={'black'} src={src} />
        <HStack p={10}>
          {reInput ? (
            <PinInput otp onComplete={verifyOtpCode} size="lg">
              <PinInputField bg={'white'} color={'black'} autoFocus />
              <PinInputField bg={'white'} color={'black'} />
              <PinInputField bg={'white'} color={'black'} />
              <PinInputField bg={'white'} color={'black'} />
              <PinInputField bg={'white'} color={'black'} />
              <PinInputField bg={'white'} color={'black'} />
            </PinInput>
          ) : null}
        </HStack>
      </VStack>
    </Flex>
  );
}
