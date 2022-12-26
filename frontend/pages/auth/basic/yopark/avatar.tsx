import CustomAvatar from '@/components/CustomAvatar';
import { CustomButton } from '@/components/CustomButton';
import BasicLayout from '@/layouts/BasicLayout';
import { Input, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { ReactElement, useState } from 'react';

const FILE_SIZE_MAX_LIMIT = 1 * 1024 * 1024; // 1MB

export default function BasicAvatarPage() {
  const [file, setFile] = useState<File>();
  const [createObjectURL, setCreateObjectURL] = useState<string>('');

  function onClickUpload() {
    const fileInput = document.querySelector('input[type=file]') as HTMLInputElement;
    if (!fileInput) {
      return;
    }
    fileInput.click();
  }

  function uploadToClient(e: React.ChangeEvent<HTMLInputElement>) {
    if (!(e.target.files && e.target.files[0])) {
      return;
    }
    const i: File = e.target.files[0];
    console.log(i.size);
    if (i.size > FILE_SIZE_MAX_LIMIT) {
      e.target.value = '';
      alert('업로드 가능한 최대 용량은 1MB입니다. ');
      return;
    }
    setFile(i);
    setCreateObjectURL(URL.createObjectURL(i));
    console.log(URL.createObjectURL(i));
  }

  const router = useRouter();
  function goToLandingPage() {
    router.push('/');
  }

  return (
    <VStack spacing={14}>
      <VStack>
        <Text fontSize="5xl">PLEASE UPLOAD YOUR AVATAR</Text>
        <CustomAvatar size="5xl" url={createObjectURL} style={{ borderRadius: '' }} />
      </VStack>
      <VStack>
        <CustomButton size="lg" onClick={onClickUpload}>
          UPLOAD
        </CustomButton>
        <Input display="none" type="file" onChange={uploadToClient} />
        <CustomButton size="lg" onClick={goToLandingPage}>
          NEXT
        </CustomButton>
      </VStack>
    </VStack>
  );
}

BasicAvatarPage.getLayout = function (page: ReactElement) {
  return <BasicLayout>{page}</BasicLayout>;
};
