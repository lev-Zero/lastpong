import React from "react";
import { useRef } from "react";
import Link from "next/link";
import { Input, Text, Flex, Button } from "@chakra-ui/react";
import useLoginStore from "@/store/useLoginStore";
import BasicLayout from "@/layouts/BasicLayout";

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
  const { name, setName } = useLoginStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const onClickNext = (event: React.MouseEvent<HTMLElement>) => {
    setName(inputRef.current?.value);
  };

  // const onChangeInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const str = event.currentTarget.value;
  //   if (str === "" || str === null) {
  //     buttonRef.current?.setAttribute("disabled", "false");
  //   } else {
  //     buttonRef.current?.setAttribute("disabled", "true");
  //   }
  //   // var regExp = /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\'\"\\\(\=]/gi;
  //   // const curText = event.currentTarget.value;
  // };

  return (
    <>
      <BasicLayout>
        <main>
          <Flex style={styles.CenterFlex}>
            <Text style={styles.MenualText}>PLEASE ENTER THE ID</Text>
            <Input
              style={styles.InputText}
              maxLength={12}
              ref={inputRef}
              // onChange={onChangeInput}
            />
            <Link href={"/auth/basicAvatar"} style={{ textDecoration: "none" }}>
              <Button
                style={styles.ThemaButton}
                onClick={onClickNext}
                ref={buttonRef}
                // disabled={true}
              >
                NEXT
              </Button>
            </Link>
          </Flex>
        </main>
      </BasicLayout>
    </>
  );
}
