import React from "react";
import { useRef } from "react";
import { Input, Text, Flex } from "@chakra-ui/react";
import { ThemaButton } from "../../../UI/atoms/ThemaButton";
import { Link } from "react-router-dom";
import useLoginStore from "../../../store/useLoginStore";

export function SetUserID() {
  const { setName } = useLoginStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const onClickNext = (event: React.MouseEvent<HTMLElement>) => {
    setName(inputRef.current?.value);
  };

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
          fontFamily={"Knewave"}
          fontSize={40}
          marginBottom={85}
          ref={inputRef}
        />
        <Link to="/auth/basic/Avatar">
          <ThemaButton label="NEXT" onClick={onClickNext} disabled={false} />
        </Link>
      </Flex>
    </div>
  );
}
