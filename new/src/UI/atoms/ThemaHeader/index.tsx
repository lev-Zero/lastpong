import React from "react";
import { Avatar, Flex, Box, Text, Image } from "@chakra-ui/react";
import useLoginStore from "../../../store/useLoginStore";
import "./index.css";

export function ThemaHeader() {
  const { name, avatarImg } = useLoginStore();

  return (
    <Flex className="MainHeader">
      <Flex className="HeaderLeft">
        <Box className="HeaderTitleBox">
          <h1 className="HeaderTitle">LASTPANG</h1>
        </Box>
        <Box className="HeaderMiniBox">
          <h1 className="HeaderMiniText">CHAT</h1>
        </Box>
        <Box className="HeaderMiniBox">
          <h1 className="HeaderMiniText">WATCH</h1>
        </Box>
      </Flex>
      <Flex className="HeaderRight">
        <Avatar
          src={avatarImg}
          size={"md"}
          marginTop={"11px"}
          marginRight={"5"}
        />
        <Flex width={"40%"}>
          <Text className="HeaderMiniText" paddingLeft={"10px"}>
            {name}
          </Text>
        </Flex>
        <Flex width={"30%"} justifyContent={"center"}>
          <Text className="HeaderMiniText">OTP</Text>
          <Box className="HeaderOtpBox" />
        </Flex>
        <Image
          src={process.env.PUBLIC_URL + "/Logout.png"}
          boxSize={"6"}
          marginLeft={"20px"}
          marginTop={"25px"}
        />
      </Flex>
    </Flex>
  );
}
