import { CustomButton } from '@/components/CustomButton';
import BasicLayout from '@/layouts/BasicLayout';
import { customFetch } from '@/utils/customFetch';
import { Box, Input, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ReactElement, useState } from 'react';

export default function BasicIdPage() {
  const [username, setUsername] = useState<string>('');
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUsername(e.currentTarget.value.toUpperCase());
  }
  async function submitUsername() {
    if (username.search(/\W|\s/g) > -1) {
      alert('영문자와 숫자만 이용할 수 있습니다');
      return;
    }
    try {
      const json = await customFetch('PATCH', '/user/me', { newUserName: username });
      router.push('/auth/basic/avatar');
      console.log(json);
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      }
    }
  }

  return (
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
        />
      </Box>
      <CustomButton size="lg" onClick={submitUsername}>
        NEXT
      </CustomButton>
    </VStack>
  );
}

BasicIdPage.getLayout = function (page: ReactElement) {
  return <BasicLayout>{page}</BasicLayout>;
};
