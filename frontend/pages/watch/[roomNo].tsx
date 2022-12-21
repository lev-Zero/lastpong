import LayoutWithoutSidebar from '@/layouts/LayoutWithoutSidebar';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';

export default function WatchRoomPage() {
  const router = useRouter();
  const { roomNo } = router.query;

  const defenderName = 'yopark';
  const challengerName = 'sunbchoi';

  return (
    <>
      <Head>
        <title>{`${defenderName} vs ${challengerName} | LastPong`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {defenderName} vs {challengerName} 관전방
      </main>
    </>
  );
}

WatchRoomPage.getLayout = function (page: ReactElement) {
  return <LayoutWithoutSidebar>{page}</LayoutWithoutSidebar>;
};
