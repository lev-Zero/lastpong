import MainLayout from "@/layouts/MainLayout";
import Head from "next/head";

import { ReactElement } from "react";

import WinLoseSum from "@/components/match-history/WinLoseSum";
import MatchHistory from "@/components/match-history/MatchHistory";
import { MatchHistoryProps } from "@/interfaces/MatchProps";
import MainPage from "@/components/MainPage";

//TODO: main이 GNB SNB 공간 주고 남은 부분을 꽉 채우게 하고싶은데 방법 모름.
export default function LandingPage() {
    return (
        <>
            <Head>
                <title>LastPong</title>
                <meta
                    name="description"
                    content="ft_transcendence project in 42 Seoul"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <MainPage />
        </>
    );
}

LandingPage.getLayout = function (page: ReactElement) {
    return <MainLayout>{page}</MainLayout>;
};

// LandingPage.getLayout = MainLayout;
