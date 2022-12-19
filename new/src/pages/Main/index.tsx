import React from "react";

import { Button, Text, Flex } from "@chakra-ui/react";
import { ThemaButton } from "../../UI/atoms/ThemaButton";
import "./index.css";

export function Main() {
  return (
    <div className="Main">
      <Flex className="CenterFlex">
        <Text className="TitleText">LASTPONG</Text>
        <ThemaButton label="START" onClick={() => console.log(1)} />
      </Flex>
    </div>
  );
}
