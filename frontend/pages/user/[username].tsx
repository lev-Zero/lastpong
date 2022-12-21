import MainLayout from '@/layouts/MainLayout';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';

export default function UserProfilePage() {
  const router = useRouter();
  const { username } = router.query;

  return (
    <>
      <Head>
        <title>{`${username} | LastPong`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>{username}의 프로필 페이지</main>
    </>
  );
}

UserProfilePage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
