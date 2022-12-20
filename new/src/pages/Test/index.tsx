import React from "react";
import { Avatar, Flex, Box, Text } from "@chakra-ui/react";
import useLoginStore from "../../store/useLoginStore";
import "./index.css";

export function Test() {
  const { name, avatarImg } = useLoginStore();

  return (
    <Flex className="MainHeader">
      <Flex className="HeaderLeft">
        {/* text-align: center; font-size: 100px; color: white; font-family:
          "Knewave"; padding: 30px; */}
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
        <Avatar src={avatarImg} size={"lg"} padding={"0.5 0"} />
        <Box className="HeaderMiniBox">
          <Text className="HeaderMiniText">{name}</Text>
        </Box>
      </Flex>
    </Flex>
  );
}
