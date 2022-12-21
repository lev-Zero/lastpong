import MainLayout from '@/layouts/MainLayout';
import Head from 'next/head';
import { ReactElement, useEffect } from 'react';

import WinLoseSum from '@/components/match-history/WinLoseSum';
import MatchHistory from '@/components/match-history/MatchHistory';
import { MatchHistoryProps } from '@/interfaces/MatchProps';
export default function LandingPage() {
  // const { bears, increasePopulation, removeAllBears } = useBearStore();

  // useEffect(() => {
  //     console.log(bears);
  // }, [bears]);

  const dummyMatchHistory: MatchHistoryProps = {
    myName: 'cmoon',
    myScore: 10,
    oppName: 'sunbchoi',
    oppScore: 1,
  };

  return (
    <>
      <Head>
        <title>LastPong</title>
        <meta name="description" content="ft_transcendence project in 42 Seoul" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {/* <button onClick={increasePopulation}>bear 늘리기</button>
                <button onClick={removeAllBears}>bear 없애기</button>
                <br />
                <div>bear number : {bears}</div> */}
        <WinLoseSum />
        <MatchHistory
          myName={dummyMatchHistory.myName}
          myScore={dummyMatchHistory.myScore}
          oppName={dummyMatchHistory.oppName}
          oppScore={dummyMatchHistory.oppScore}
        />
      </main>
    </>
  );
}

LandingPage.getLayout = function (page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

// LandingPage.getLayout = MainLayout;
