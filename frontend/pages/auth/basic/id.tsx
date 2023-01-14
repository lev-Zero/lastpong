import { CustomButton } from '@/components/CustomButton';
import BasicLayout from '@/layouts/BasicLayout';
import { userStore } from '@/stores/userStore';
import { customFetch } from '@/utils/customFetch';
import { Box, Input, Text, VStack } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement, useRef, useState } from 'react';
import Swal from 'sweetalert2';
export default function BasicIdPage() {
  const [inputName, setInputName] = useState<string>('');
  const router = useRouter();
  const { fetchMe } = userStore();
  const inputRef = useRef<HTMLInputElement>(null);
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputName(e.currentTarget.value.toLowerCase());
  }

  function handleEnterKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === 'Enter') {
      submitInputName();
    }
  }

  function idInputFailAlert(title: string) {
    Swal.fire({
      backdrop: `    rgba(0,0,123)
        url("/nyan-cat-4k.gif")
        left top
        repeat
        
      `,
      title: title,
      // text: '다시 되돌릴 수 없습니다. 신중하세요.',
      icon: 'warning',
      // showCancelButton: true,
      confirmButtonColor: '#3085d6',
      // cancelButtonColor: '#d33',
      confirmButtonText: '다시 해볼게',
      // cancelButtonText: '안 할래',
    }).then((result) => {
      if (result.isConfirmed) {
        // Swal.fire('승인이 완료되었습니다.', '화끈하시네요~!', 'success');
        // onOpen();
        setInputName('');
        if (inputRef.current !== null) inputRef.current.focus();
      }
    });
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
            ref={inputRef}
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
