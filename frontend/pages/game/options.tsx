import MainLayout from '@/layouts/MainLayout';
import Head from 'next/head';
import { ReactElement } from 'react';

export default function GameOptionsPage() {
  return (
    <>
      <Head>
        <title>게임 옵션 선택 | LastPong</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>게임 옵션 선택 페이지</main>
    </>
  );
}

GameOptionsPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
