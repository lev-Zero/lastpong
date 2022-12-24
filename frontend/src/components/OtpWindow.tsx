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
import { useState } from 'react';

interface OtpWindowProps {
  src: string;
}

const SERVER_URL: string = 'http://localhost:3000';

export default function OtpWindow({ src }: OtpWindowProps) {
  const [code, setCode] = useState<string>('');

  function handleOtpCode(code: string) {
    setCode(code);
    if (code.length === 6) {
      const cookies = Object.fromEntries(
        document.cookie.split(';').map((cookie) => cookie.trim().split('='))
      );

      const jwtToken: string = `Bearer ${cookies['accessToken']}`;
      const headers = {
        authorization: jwtToken,
      };
      const body = { code };

      fetch(SERVER_URL + '/auth/login/otp', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: headers,
      })
        .then(console.log)
        .catch();
    }
  }

  return (
    <Flex border={'2px'} p={'20'} borderRadius={'20%'}>
      <VStack>
        <Image border={'2px'} borderColor={'black'} src={src} />
        <HStack p={10}>
          <PinInput otp onChange={(code) => handleOtpCode(code)}>
            <PinInputField bg={'white'} color={'black'} />
            <PinInputField bg={'white'} color={'black'} />
            <PinInputField bg={'white'} color={'black'} />
            <PinInputField bg={'white'} color={'black'} />
            <PinInputField bg={'white'} color={'black'} />
            <PinInputField bg={'white'} color={'black'} />
          </PinInput>
        </HStack>
      </VStack>
    </Flex>
  );
}
