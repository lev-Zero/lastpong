import { CustomButton } from '@/components/CustomButton';
import BasicLayout from '@/layouts/BasicLayout';
import { Input, Spacer, Text } from '@chakra-ui/react';
import React, { ReactElement, useState } from 'react';
import { setTokenSourceMapRange } from 'typescript';
import create from 'zustand';

interface AuthBasicPageProps {
  name: string;
  setName: (name: string) => void;
  isNextPage: boolean;
  toggleIsNextPage: () => void;
}

const useAuthBasicPageStore = create<AuthBasicPageProps>((set) => ({
  name: '',
  setName: (name) => {
    set((state) => ({ ...state, name: name }));
  },
  isNextPage: false,
  toggleIsNextPage: () => set((state) => ({ isNextPage: !state.isNextPage })),
}));

function InputNamePage() {
  const { setName, toggleIsNextPage } = useAuthBasicPageStore();
  const handleChange = (e: React.FormEvent<HTMLInputElement>) => setName(e.currentTarget.value);
  return (
    <>
      <Text fontSize="4xl">PLEASE ENTER THE ID</Text>
      <Input bg="white" color="black" textAlign="center" fontSize="xl" onChange={handleChange} />
      <CustomButton size="lg" onClick={toggleIsNextPage}>
        NEXT
      </CustomButton>
    </>
  );
}

function InputProfileImgPage() {
  return (
    <>
      <Text fontSize="5xl">PLEASE UPLOAD YOUR AVATAR</Text>
      <CustomButton size="lg" onClick={() => {}}>
        UPLOAD
      </CustomButton>
      <CustomButton size="lg" onClick={() => {}}>
        NEXT
      </CustomButton>
    </>
  );
}

export default function AuthBasicPage() {
  const { isNextPage } = useAuthBasicPageStore();
  return <>{!isNextPage ? <InputNamePage /> : <InputProfileImgPage />}</>;
}

AuthBasicPage.getLayout = function (page: ReactElement) {
  return <BasicLayout>{page}</BasicLayout>;
};
