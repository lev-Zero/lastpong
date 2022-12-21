import MainLayout from '@/layouts/MainLayout';
import Head from 'next/head';
import { ReactElement } from 'react';

export default function WatchPage() {
  return (
    <>
      <Head>
        <title>관전 | LastPong</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>관전 페이지</main>
    </>
  );
}

WatchPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
