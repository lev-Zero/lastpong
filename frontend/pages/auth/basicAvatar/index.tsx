import React from "react";
// import Head from "next/head";
import BasicLayout from "@/layouts/BasicLayout";
import { useRef, useState } from "react";
import { Avatar, Text, Flex, Input, Box, Button } from "@chakra-ui/react";
import useLoginStore from "@/store/useLoginStore";
import Link from "next/link";

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
    margin: "5px",
  } as React.CSSProperties,
};

export default function BasicAvatarPage() {
  const selectFile = useRef<HTMLInputElement>();
  const selectAvatar = useRef<HTMLSpanElement>();
  const [ImageFile, setImageFile] = useState<any>(null);
  const { avatarImg, setAvatarImg } = useLoginStore();

  const onChangeInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    if (event.currentTarget.files !== null) {
      if (event.currentTarget.files.length === 0) return;
      const file = event.currentTarget.files[0];
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImageFile(reader.result);
        setAvatarImg(reader.result);
      };
    }
  };

  return (
    <>
      <BasicLayout>
        <main>
          <Flex style={styles.CenterFlex}>
            <Text style={styles.MenualText}>PLEASE UPLOAD YOUR AVATAR</Text>
            <Input
              type={"file"}
              style={{ display: "none" }}
              ref={selectFile}
              accept={"image/*"}
              onChange={onChangeInput}
              id={"realPath"}
            />
            <Flex
              width={"300px"}
              height={"300px"}
              backgroundColor={"white"}
              justifyContent={"center"}
              alignItems={"center"}
              borderRadius={"150px"}
              margin={"30px"}
            >
              <Avatar
                maxHeight={"300px"}
                maxWidth={"300px"}
                borderRadius={"150px"}
                src={avatarImg}
                ref={selectAvatar}
              />
              {/* <Avatar size={"full"} ref={selectAvatar} /> */}
            </Flex>
            <Button
              style={styles.ThemaButton}
              onClick={() => selectFile.current?.click()}
            >
              UPLOAD
            </Button>
            <Link href={"/"} style={{ textDecoration: "none" }}>
              <Button style={styles.ThemaButton}>NEXT</Button>
            </Link>
          </Flex>
        </main>
      </BasicLayout>
    </>
  );
}
