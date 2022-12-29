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
    try {
      const json = await customFetch('GET', '/user/test/create/fakeuser');
      console.log(json);
    } catch (e) {
      console.log('이미 생성되었습니다.');
    }
  }

  async function loginFakeUser(id: string) {
    console.log('/user/test/read/fakeuser/fake_U' + id);
    try {
      const json = await customFetch('GET', '/user/test/read/fakeuser/fake_U' + id);
      setCookie('accessToken', json.token);

      const user: UserProps = {
        name: json.username,
        imgUrl: json.avatar.profileUrl,
        status: json.status,
        rating: json.rating,
        useOtp: false,
      };

      setMe(user);

      console.log('set user : ', user);
      console.log(json);
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
