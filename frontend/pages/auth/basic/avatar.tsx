import React, { useEffect } from 'react';
// import Head from "next/head";
import BasicLayout from '@/layouts/BasicLayout';
import { useRef, useState } from 'react';
import { Avatar, Text, Flex, Input, Image, Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { SERVER_URL } from '@/utils/variables';
import { customFetch } from '@/utils/customFetch';
import { getJwtToken } from '@/utils/getJwtToken';

const styles = {
  MenualText: {
    textAlign: 'center',
    fontSize: '40px',
    color: 'white',
    padding: '0px',
  } as React.CSSProperties,

  CenterFlex: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    height: '100vh',
  } as React.CSSProperties,

  ThemaButton: {
    width: '200px',
    height: '74px',
    fontSize: '40px',
    color: 'white',
    backgroundColor: '#4267b2',
    borderColor: 'white',
    border: '2px',
    borderStyle: 'solid',
    borderWidth: '3px',
    borderRadius: '60px',
    margin: '5px',
    // display: 'none',
  } as React.CSSProperties,
};

export default function BasicAvatarPage() {
  const selectFile = useRef<HTMLInputElement>();
  const selectAvatar = useRef<HTMLSpanElement>();
  const [imageFile, setImageFile] = useState<any>(null);
  const [avatarImg, setAvatarImg] = useState<any>();
  const router = useRouter();

  function FileToImg(file: any) {
    const reader = new FileReader();
    const AvatarFile = file;
    reader.readAsDataURL(AvatarFile);
    reader.onloadend = () => {
      setAvatarImg(reader.result);
    };
  }

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files !== null) {
      if (event.currentTarget.files.length === 0) return;
      setImageFile(event.currentTarget.files[0]);
      FileToImg(event.currentTarget.files[0]);
    }
  };

  const goNext = async () => {
    const jwtToken: string = `Bearer ${getJwtToken()}`;
    const formData = new FormData();
    if (imageFile) {
      formData.append('file', imageFile);
    }
    const response = await fetch(SERVER_URL + '/user/avatar/me', {
      method: 'PUT',
      headers: { Authorization: jwtToken },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('에러 발생');
    }
    const json = await response.json();
    console.log(json);
    router.push('/');
  };

  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      console.log('User pressed: ', event.key);

      if (event.key === 'Enter') {
        event.preventDefault();

        // 👇️ your logic here
        goNext();
      }
    };

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, []);

  return (
    <>
      <BasicLayout>
        <main>
          <Flex style={styles.CenterFlex}>
            <Text style={styles.MenualText}>PLEASE UPLOAD YOUR AVATAR</Text>
            <Flex
              width={'300px'}
              height={'300px'}
              backgroundColor={'white'}
              justifyContent={'center'}
              alignItems={'center'}
              borderRadius={'150px'}
              margin={'30px'}
            >
              <Avatar
                maxHeight={'300px'}
                maxWidth={'300px'}
                borderRadius={'150px'}
                src={avatarImg}
                size={'full'}
                ref={selectAvatar}
              />
            </Flex>
            <Button style={styles.ThemaButton} onClick={() => selectFile.current?.click()}>
              UPLOAD
            </Button>

            {/* <Button style={styles.ThemaButton} onClick={onClickCheck}>
              Avatar ME TEST
            </Button> */}
            <form
              name="accountFrm"
              method="put"
              encType="multipart/form-data"
              style={{ color: 'black' }}
            >
              <input
                type="file"
                ref={selectFile}
                style={{ display: 'none' }}
                accept={'image/*'}
                name="profile_img"
                onChange={onChangeInput}
              />
              <Button style={styles.ThemaButton} onClick={goNext}>
                NEXT
              </Button>
            </form>
          </Flex>
        </main>
      </BasicLayout>
    </>
  );
}
