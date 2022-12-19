import React from "react";

import { Input, Text, Flex } from "@chakra-ui/react";
import { ThemaButton } from "../../../UI/atoms/ThemaButton";
import "./index.css";

export function SetUserID() {
  return (
    <div className="setUserID">
      <Flex className="CenterFlex">
        <Text className="MenualText">PLEASE ENTER THE ID</Text>
        <Input
          type={"text"}
          maxLength={12}
          width={"720px"}
          height={"80px"}
          backgroundColor={"white"}
          textAlign={"center"}
          fontFamily="Knewave"
          fontSize={40}
          marginBottom={85}
        />
        <ThemaButton label="NEXT" onClick={() => console.log(1)} />
      </Flex>
    </div>
  );
}
