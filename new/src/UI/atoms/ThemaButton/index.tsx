import React from "react";
import { Button } from "@chakra-ui/react";
import "./index.css";

interface IThemaButton {
  label: string;
  onClick: React.MouseEventHandler;
}

export function ThemaButton(props: IThemaButton) {
  return (
    <Button
      fontFamily={"Knewave"}
      fontSize={40}
      textColor="white"
      bg={"#4267b2"}
      border="2px"
      height="74px"
      width={"200px"}
      margin={5}
      borderRadius={"50"}
      className="ThemaButton"
      onClick={props.onClick}
    >
      {props.label}
    </Button>
  );
}
