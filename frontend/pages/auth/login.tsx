import React from "react";
import Head from "next/head";
import { ReactElement } from "react";
import { CustomButton } from "@/components/CustomButton";
import { Center, Text } from "@chakra-ui/react";
import Link from "next/link";

import useLoginStore from "@/store/useLoginStore";
import BasicLayout from "@/layouts/BasicLayout";

const styles = {
  MainText: {
    fontSize: "140px",
    alignItems: "center",
    justifyContent: "center",
    flexDir: "column",
  } as React.CSSProperties,
};

export default function AuthLoginPage() {
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
      <main>
        <Center flexDir={"column"}>
          <Text style={styles.MainText}> LAST PONG </Text>
          <Link href={"http://localhost:3000/auth/"}>
            <CustomButton
              size="md"
              onClick={() => {
                console.log("OK");
              }}
            >
              START
            </CustomButton>
          </Link>
        </Center>
      </main>
    </>
  );
}

AuthLoginPage.getLayout = function (page: ReactElement) {
  return <BasicLayout>{page}</BasicLayout>;
};
