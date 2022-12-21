import MainLayout from "@/layouts/MainLayout";
import Head from "next/head";
import { ReactElement } from "react";

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>LastPong</title>
        <meta
          name="description"
          content="ft_transcendence project in 42 Seoul"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>Index 페이지</main>
    </>
  );
}

LandingPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
