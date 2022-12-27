import React, { ReactElement, useEffect } from 'react';
import { VStack, Text, Spacer } from '@chakra-ui/react';
import { CustomButton } from '@/components/CustomButton';
import BasicLayout from '@/layouts/BasicLayout';
import { customFetch } from '@/utils/customFetch';
import { userStore } from '@/stores/userStore';
import { setCookie } from 'typescript-cookie';
import { useRouter } from 'next/router';
import { UserProps } from '@/interfaces/UserProps';
import { convertUserStatus } from '@/interfaces/convertUserStatus';

export default function FakeLogin() {
  // useEffect(() => {
  //   async function fetchData() {
  //     try {
  //       const json = await customFetch('GET', '/user/me');
  //       console.log(json);

  //       // user 정보 zustand에 저장하기
  //       const dummyUser: UserProps = {
  //         name: json.username,
  //         imgUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png',
  //         status: json.status,
  //         rating: json.rating,
  //         winCnt: 1222,
  //         loseCnt: 999,
  //         useOtp: false,
  //       };

  //       setUser(dummyUser);

  //       setIsLogin(true);
  //     } catch (e) {
  //       setIsLogin(false);
  //     } finally {
  //       setIsLoaded(true);
  //     }
  //   }
  //   fetchData();
  // }, []);
  const { user, setUser } = userStore();
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
        status: convertUserStatus(json.status),
        rating: json.rating,
        winCnt: 3,
        loseCnt: 3,
        useOtp: false,
      };

      setUser(user);

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
