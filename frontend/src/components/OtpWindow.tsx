import React from "react";
import { SERVER_URL } from "@/variables";

import { getCookie, setCookie, removeCookie } from "typescript-cookie";
import {
  Flex,
  Image,
  VStack,
  HStack,
  PinInput,
  PinInputField,
  PinInputDescendantsProvider,
  Input,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";

interface OtpWindowProps {
  src: string;
}

export default function OtpWindow({ src }: OtpWindowProps) {
  const [code, setCode] = useState<string>("");
  const router = useRouter();

  function handleOtpCode(code: string) {
    setCode(code);
    if (code.length === 6) {
      const cookies = Object.fromEntries(
        document.cookie.split(";").map((cookie) => cookie.trim().split("="))
      );
      const jwtToken: string = `Bearer ${cookies["accessToken"]}`;
      const headers = {
        Authorization: jwtToken,
        "Content-Type": "application/json",
      };

      const body = { code: code };

      fetch(SERVER_URL + "/auth/login/otp", {
        method: "POST",
        body: JSON.stringify(body),
        headers: headers,
      })
        .then((response) => {
          if (!response.ok) {
            console.log("틀렸습니다");
            return;
          }
          return response.json();
        })
        .then((json) => {
          if (json === undefined) {
            alert("OTP 인증에 실패하였습니다");
            return;
          }
          let newToken = json.token;
          removeCookie("accessToken");
          setCookie("accessToken", newToken, { path: "", expires: 7 });
          router.push("/");
        });
    }
  }

  return (
    <Flex border={"2px"} p={"20"} borderRadius={"20%"}>
      <VStack>
        <Image border={"2px"} borderColor={"black"} src={src} />
        <HStack p={10}>
          <PinInput otp onChange={(code) => handleOtpCode(code)}>
            <PinInputField bg={"white"} color={"black"} />
            <PinInputField bg={"white"} color={"black"} />
            <PinInputField bg={"white"} color={"black"} />
            <PinInputField bg={"white"} color={"black"} />
            <PinInputField bg={"white"} color={"black"} />
            <PinInputField bg={"white"} color={"black"} />
          </PinInput>
        </HStack>
      </VStack>
    </Flex>
  );
}
