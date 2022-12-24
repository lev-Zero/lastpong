import React from "react";
import Head from "next/head";
import { useState, useEffect } from "react";
import { ReactElement } from "react";
import { CustomButton } from "@/components/CustomButton";
import { Center, Text } from "@chakra-ui/react";
import Link from "next/link";
import useLoginStore from "@/store/useLoginStore";
import BasicLayout from "@/layouts/BasicLayout";
import OtpWindow from "@/components/OtpWindow";

const styles = {
  MainText: {
    fontSize: "140px",
    alignItems: "center",
    justifyContent: "center",
    flexDir: "column",
  } as React.CSSProperties,
};

export default function AuthLoadingPage() {
  let otpStatus: boolean;
  let authStr: string;
  let profileURl: string;
  let obj: any;

  const [qrCodeSrc, setQrCodeSrc] = useState<string>("");

  useEffect(() => {
    console.log(document.cookie);
    console.log("!!");

    const cookies = Object.fromEntries(
      document.cookie.split(";").map((cookie) => cookie.trim().split("="))
    );
    console.log(cookies["accessToken"]);
    authStr = "Bearer " + cookies["accessToken"];
    otpStatus = cookies["otpStatus"];
    profileURl = cookies["profileUrl"];

    fetch("http://localhost:3000/auth/login/otp/check", {
      method: "GET",
      headers: {
        authorization: authStr,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        setQrCodeSrc(json.qrCode);
      });
  }, []);

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
      {qrCodeSrc === "" ? (
        <Text>LOADING...</Text>
      ) : (
        <OtpWindow src={qrCodeSrc} />
      )}
    </>
  );
}

AuthLoadingPage.getLayout = function (page: ReactElement) {
  return <BasicLayout>{page}</BasicLayout>;
};
