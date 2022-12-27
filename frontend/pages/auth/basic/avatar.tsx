import React from 'react';
// import Head from "next/head";
import BasicLayout from '@/layouts/BasicLayout';
import { useRef, useState } from 'react';
import { Avatar, Text, Flex, Input, Image, Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { SERVER_URL } from '@/utils/variables';
import useLoginStore from '@/store/useLoginStore';

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
  const { avatarImg, setAvatarImg } = useLoginStore();
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
      // console.log(imageFile);
      // console.log(event.currentTarget.files[0]);
      // setImageFile(event.currentTarget.files[0]);
      // console.log(imageFile);
      setImageFile(event.currentTarget.files[0]);
      FileToImg(event.currentTarget.files[0]);
    }
  };

  const urlToObject = async (imageUrl: string) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: blob.type });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    if (selectFile.current) selectFile.current.files = dataTransfer.files;
    FileToImg(file);
  };

  const onClickNext = async (event: React.MouseEvent<HTMLElement>) => {
    const cookies = Object.fromEntries(
      document.cookie.split(';').map((cookie) => cookie.trim().split('='))
    );
    const jwtToken: string = `Bearer ${cookies['accessToken']}`;
    const formData = new FormData();
    if (imageFile) {
      formData.append('file', imageFile);
      console.log(formData.getAll);
    }
    fetch(SERVER_URL + '/user/avatar/me', {
      method: 'PUT',
      body: formData,
      headers: { Authorization: jwtToken },
    })
      .then((response) => {
        if (response.ok === true) {
          return response.json();
        }
        throw new Error('에러 발생!');
      })
      .catch((error) => {
        alert(error);
      })
      .then((data) => {
        console.log(data);
      });
    // router.push('/');
  };

  const onClickCheck = async (event: React.MouseEvent<HTMLElement>) => {
    const cookies = Object.fromEntries(
      document.cookie.split(';').map((cookie) => cookie.trim().split('='))
    );
    const jwtToken: string = `Bearer ${cookies['accessToken']}`;

    fetch(SERVER_URL + '/user/avatar/me', {
      headers: {
        Authorization: jwtToken,
        'Content-Type': 'image/*',
      },
    })
      .then((response) => {
        const reader = response.body?.getReader();
        return new ReadableStream({
          start(controller) {
            function pump() {
              return reader?.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                controller.enqueue(value);
                pump();
                return;
              });
            }
            return pump();
          },
        });
      })
      .then((stream) => new Response(stream))
      .then((response) => response.blob())
      .then((blob) => URL.createObjectURL(blob))
      .then((url) => {
        setAvatarImg(url);
        console.log(url);
      })
      .catch((err) => console.error(err));
  };

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

            <Button style={styles.ThemaButton} onClick={onClickCheck}>
              Avatar ME TEST
            </Button>
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
              <Button style={styles.ThemaButton} onClick={onClickNext}>
                NEXT
              </Button>
            </form>
          </Flex>
        </main>
      </BasicLayout>
    </>
  );
}
