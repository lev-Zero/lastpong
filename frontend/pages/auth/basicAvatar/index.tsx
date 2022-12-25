import React from "react";
// import Head from "next/head";
import BasicLayout from "@/layouts/BasicLayout";
import { useRef, useState } from "react";
import {
  Avatar,
  Text,
  Flex,
  Input,
  Image,
  Box,
  Button,
} from "@chakra-ui/react";
import useLoginStore from "@/store/useLoginStore";
import { useRouter } from "next/router";
import { SERVER_URL } from "@/variables";

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
      console.log(file);
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImageFile(reader.result);
        setAvatarImg(reader.result);
      };
    }
  };

  const onClickNext = (event: React.MouseEvent<HTMLElement>) => {
    const router = useRouter();
    router.push("/");
  };

  const onClickCheck = (event: React.MouseEvent<HTMLElement>) => {
    const cookies = Object.fromEntries(
      document.cookie.split(";").map((cookie) => cookie.trim().split("="))
    );

    const jwtToken: string = `Bearer ${cookies["accessToken"]}`;
    const jwtToken42: string = `Bearer ${cookies["accessToken42"]}`;

    let headers = {
      Authorization: jwtToken,
      "Content-Type": "application/json",
    };

    const headersOTP = {
      Authorization: jwtToken,
      "Content-Type": "application/json",
    };

    const headers42 = {
      Authorization: jwtToken42,
      "Content-Type": "application/json",
    };

    let profilePhoto: any;
    let userName: any;
    headers = headersOTP;

    fetch(SERVER_URL + "/user/avatar/me", { headers })
      .then((response) => response.json())
      .then((json) => {
        profilePhoto = json.profilePhoto;
        userName = json.username;
        console.log(json);
      });

    if (profilePhoto === undefined) {
      console.log("AVATAR EMPTY");
      headers = headers42;
      var decodeURL = decodeURIComponent(cookies["profileUrl"]);

      fetch(decodeURL, { headers })
        .then((response) => response.json())
        .then((json) => {
          setAvatarImg(json.image.link);
          profilePhoto = json.image.link;
          console.log(profilePhoto);
        });
    }

    var myFile;
    fetch(profilePhoto)
      .then((res) => res.blob())
      .then((myBlob) => {
        // debugger;
        myFile = new File(["File"], "image.jpeg", { type: myBlob.type });
        return myFile;
      })
      .then((ImageFile) => {
        var form = new FormData();
        form.append("file", ImageFile, "image.jpg");
        console.log(form.getAll("file"));
        const body = { file: form };
        headers = headersOTP;

        fetch(SERVER_URL + "/user/avatar/me", {
          method: "PUT",
          body: JSON.stringify(body),
          headers: headers,
        })
          .then((res) => res.json())
          .then((json) => console.log(json));
      });

    console.log(myFile);
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
                size={"full"}
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
            <Button style={styles.ThemaButton} onClick={onClickNext}>
              NEXT
            </Button>
            <Button style={styles.ThemaButton} onClick={onClickCheck}>
              Avatar ME TEST
            </Button>
          </Flex>
        </main>
      </BasicLayout>
    </>
  );
}
