import React from "react";
import { useState, useRef } from "react";
import Link from "next/link";
import { Input, Text, Flex, Button } from "@chakra-ui/react";
import useLoginStore from "@/store/useLoginStore";
import BasicLayout from "@/layouts/BasicLayout";
import { SERVER_URL } from "@/variables";
import { useRouter } from "next/router";

const styles = {
  MenualText: {
    textAlign: "center",
    fontSize: "40px",
    color: "white",
    padding: "0px",
  } as React.CSSProperties,

  CenterFlex: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    height: "100vh",
  } as React.CSSProperties,

  InputText: {
    type: "text",
    width: "720px",
    height: "80px",
    backgroundColor: "white",
    textAlign: "center",
    fontSize: "40px",
    marginBottom: "85px",
  } as React.CSSProperties,

  ThemaButton: {
    width: "200px",
    height: "74px",
    fontSize: "40px",
    color: "white",
    backgroundColor: "#4267b2",
    borderColor: "white",
    border: "2px",
    borderStyle: "solid",
    borderWidth: "3px",
    borderRadius: "60px",
  } as React.CSSProperties,
};

export default function BasicIdPage() {
  const [check, setCheck] = useState("block");
  const { name, setName } = useLoginStore();
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const buttonCheckRef = useRef<HTMLDivElement>(null);
  const buttonNextRef = useRef<HTMLDivElement>(null);

  const onClickCheck = (event: React.MouseEvent<HTMLElement>) => {
    var str: string;
    str = "";
    if (inputRef.current) str = inputRef.current?.value;

    //공백만 입력된 경우
    var blank_pattern = /^\s+|\s+$/g;
    if (str.replace(blank_pattern, "") == "") {
      alert("공백만 입력되었습니다.");
      return;
    }

    //문자열에 공백이 있는 경우
    var blank_pattern = /[\s]/g;
    if (blank_pattern.test(str) == true) {
      alert("공백이 입력되었습니다.");
      return;
    }

    //특수문자가 있는 경우
    var special_pattern = /[`~!@#$%^&*|\\\'\";:\/?]/gi;
    if (special_pattern.test(str) == true) {
      alert("특수문자가 입력되었습니다.");
      return;
    }

    //공백 혹은 특수문자가 있는 경우
    if (str.search(/\W|\s/g) > -1) {
      alert("특수문자 또는 공백이 입력되었습니다.");
      return;
    }

    if (check === "none") {
      setCheck("block");
    } else {
      {
        setCheck("none");
        if (inputRef.current) inputRef.current.disabled = true;
        if (buttonNextRef.current)
          buttonNextRef.current.style.display = "block";
      }
    }
    setName(inputRef.current?.value);
  };

  const onChangeInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const str = event.currentTarget.value;
    console.log(str);
  };

  const onClickUser = (event: React.MouseEvent<HTMLElement>) => {
    const cookies = Object.fromEntries(
      document.cookie.split(";").map((cookie) => cookie.trim().split("="))
    );

    const jwtToken: string = `Bearer ${cookies["accessToken"]}`;
    const headers = {
      Authorization: jwtToken,
      "Content-Type": "application/json",
    };
    fetch(SERVER_URL + "/user/me", { headers }).then((res) => {
      if (!res.ok) {
        console.log(res);
      }
    });
  };

  const onClickNext = (event: React.MouseEvent<HTMLElement>) => {
    setName(inputRef.current?.value);
    router.push("/auth/basicAvatar");
  };

  return (
    <>
      <BasicLayout>
        <main>
          <Flex style={styles.CenterFlex}>
            <Text style={styles.MenualText}>PLEASE ENTER THE ID</Text>
            <Input
              color={"black"}
              style={styles.InputText}
              maxLength={12}
              ref={inputRef}
              onChange={onChangeInput}
              // disabled={true}
            />
            <Button
              style={styles.ThemaButton}
              onClick={onClickCheck}
              ref={buttonCheckRef}
              display={check}
            >
              CHECk
            </Button>
            <Link href={"/auth/basicAvatar"} style={{ textDecoration: "none" }}>
              <Button
                style={styles.ThemaButton}
                onClick={onClickNext}
                ref={buttonNextRef}
                display={"none"}
              >
                NEXT
              </Button>
            </Link>
            <Button onClick={onClickUser}>UserSetting</Button>
          </Flex>
        </main>
      </BasicLayout>
    </>
  );
}
