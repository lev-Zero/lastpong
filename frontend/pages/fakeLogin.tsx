import React, { ReactElement, useEffect } from 'react';
import { VStack, Text, Spacer } from '@chakra-ui/react';
import { CustomButton } from '@/components/CustomButton';
import BasicLayout from '@/layouts/BasicLayout';
import { customFetch } from '@/utils/customFetch';
import { userStore } from '@/stores/userStore';
import { setCookie } from 'typescript-cookie';
import { useRouter } from 'next/router';
import { UserProps } from '@/interfaces/UserProps';

export default function FakeLogin() {
  const { setMe } = userStore();
  const router = useRouter();

  async function createFakeUsers() {
    const text = await customFetch('GET', '/user/test/read/fakeuser/fake_U1');
    if (text !== '') {
      console.log('fakeUser가 이미 만들어져 있습니다');
      return;
    }
    await customFetch('GET', '/user/test/create/fakeuser');
  }

  async function loginFakeUser(id: string) {
    console.log('/user/test/read/fakeuser/fake_U' + id);
    try {
      const json = await customFetch('GET', '/user/test/read/fakeuser/fake_U' + id);
      setCookie('accessToken', json.token);

      const user: UserProps = {
        id: json.id,
        name: json.username,
        imgUrl: json.avatar.profileUrl,
        status: json.status,
        rating: json.rating,
      };

      setMe(user);
      console.log(`fake_U${id}로 로그인 중...`);
      router.push('/home');
    } catch (e) {
      console.log('에러 발생');
    }
  }

  useEffect(() => {
    createFakeUsers();
  }, []);

  function goToLogin(id: number) {
    const userID = id.toString();
    loginFakeUser(userID);
  }

  const retArr = [];
  for (let i = 1; i < 6; i++) {
    retArr.push(
      <CustomButton
        size="lg"
        key={i}
        onClick={() => {
          goToLogin(i);
        }}
      >
        USER_{i}
      </CustomButton>
    );
  }
  return (
    <VStack>
      <Text fontSize={30}>FAKE LOGIN</Text>
      <Spacer />
      <VStack>{retArr}</VStack>
    </VStack>
  );
}

FakeLogin.getLayout = function (page: ReactElement) {
  return <BasicLayout>{page}</BasicLayout>;
};
