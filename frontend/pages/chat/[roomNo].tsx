import MainLayout from '@/layouts/MainLayout';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';

export default function ChatRoomPage() {
  const router = useRouter();
  const { roomNo } = router.query;

  const title = '지금 심심하신 분~';

  return (
    <>
      <Head>
        <title>{`${title} | LastPong`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>{roomNo}번 채팅방</main>
    </>
  );
}

ChatRoomPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
