import React, { useEffect } from 'react';
import BasicLayout from '@/layouts/BasicLayout';
import { useRef, useState } from 'react';
import { Avatar, Text, VStack, Box } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CustomButton } from '@/components/CustomButton';
import { SERVER_URL } from '@/utils/variables';
import { getJwtToken } from '@/utils/getJwtToken';

export default function BasicAvatarPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarImgFile, setAvatarImgFile] = useState<any>(null);
  const [avatarImg, setAvatarImg] = useState<any>();
  const router = useRouter();

  function onChangeInput(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.currentTarget.files || event.currentTarget.files.length === 0) {
      return;
    }
    const file = event.currentTarget.files[0];
    setAvatarImgFile(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setAvatarImg(reader.result);
    };
  }

  async function submitAvatar() {
    if (!avatarImgFile) {
      router.push('/');
      return;
    }
    const formData = new FormData();
    formData.append('file', avatarImgFile);
    fetch(SERVER_URL + '/user/avatar/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${getJwtToken()}` },
      body: formData,
    })
      .then(() => router.push('/'))
      .catch(console.log);
  }

  function handleEnterKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      submitAvatar();
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleEnterKeyDown);
    return () => {
      document.removeEventListener('keydown', handleEnterKeyDown);
    };
  }, []);

  return (
    <>
      <Head>
        <title>기본 정보 입력 | LastPong</title>
        <meta name="description" content="ft_transcendence project in 42 Seoul" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BasicLayout>
        <main>
          <VStack spacing={10}>
            <Text fontSize="5xl" color="white">
              PLEASE UPLOAD YOUR AVATAR
            </Text>
            <Box width="300px" height="300px">
              <Avatar src={avatarImg} size="full" />
            </Box>
            <VStack spacing={3}>
              <CustomButton size="lg" onClick={() => fileRef.current?.click()}>
                UPLOAD
              </CustomButton>
              <form
                name="accountFrm"
                method="put"
                encType="multipart/form-data"
                style={{ color: 'black' }}
              >
                <input
                  type="file"
                  ref={fileRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  name="profile_img"
                  onChange={onChangeInput}
                />
                <CustomButton size="lg" onClick={submitAvatar}>
                  NEXT
                </CustomButton>
              </form>
            </VStack>
          </VStack>
        </main>
      </BasicLayout>
    </>
  );
}
