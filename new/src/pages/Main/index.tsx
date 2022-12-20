import React from "react";
import { useRef } from "react";
import { Text, Flex } from "@chakra-ui/react";
import { ThemaButton } from "../../UI/atoms/ThemaButton";
import "./index.css";

import { Link } from "react-router-dom";

export function Main() {
  return (
    <div className="Main">
      <Flex className="CenterFlex">
        <Text className="TitleText">LASTPONG</Text>
        <Link to="/auth/basic/ID">
          <ThemaButton
            label="START"
            onClick={() => console.log()}
            disabled={false}
          />
        </Link>
      </Flex>
    </div>
  );
}
