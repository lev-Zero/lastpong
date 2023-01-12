import { CustomButton } from '@/components/CustomButton';
import BasicLayout from '@/layouts/BasicLayout';
import { userStore } from '@/stores/userStore';
import { customFetch } from '@/utils/customFetch';
import { Box, Input, Text, VStack } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement, useState } from 'react';

export default function BasicIdPage() {
  const [inputName, setInputName] = useState<string>('');
  const router = useRouter();
  const { fetchMe } = userStore();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputName(e.currentTarget.value.toLowerCase());
  }

  function handleEnterKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === 'Enter') {
      submitInputName();
    }
  }

  async function submitInputName() {
    if (inputName.search(/[^A-Za-z0-9ㄱ-ㅎ가-힣]/) > -1) {
      alert('한글/영어/숫자만 이용할 수 있습니다');
      return;
    }
    customFetch('PATCH', '/user/me', { newUserName: inputName })
      .then(() => fetchMe())
      .then(() => router.push('/auth/basic/avatar'))
      .catch(console.log);
  }

  return (
    <>
      <Head>
        <title>기본 정보 입력 | LastPong</title>
        <meta name="description" content="ft_transcendence project in 42 Seoul" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <VStack spacing={14}>
        <Box>
          <Text fontSize="5xl">PLEASE ENTER THE ID</Text>
          <Input
            bg="white"
            color="black"
            size="lg"
            textAlign="center"
            fontSize="2xl"
            maxLength={10}
            textTransform="uppercase"
            onChange={handleChange}
            onKeyDown={handleEnterKeyDown}
            autoFocus
          />
        </Box>
        <CustomButton size="lg" onClick={submitInputName}>
          NEXT
        </CustomButton>
      </VStack>
    </>
  );
}

BasicIdPage.getLayout = function (page: ReactElement) {
  return <BasicLayout>{page}</BasicLayout>;
};
