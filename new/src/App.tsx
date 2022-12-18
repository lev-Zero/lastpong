import React from "react";
import "./App.css";
import { Button, Text, Flex } from "@chakra-ui/react";

function App() {
  return (
    <div className="App">
      <Flex
        flexDirection={"column"}
        justifyItems={"center"}
        justifyContent={"center"}
        alignContent={"center"}
        alignItems={"center"}
        textAlign={"center"}
        height="100vh"
      >
        <div>
          <Text
            textColor={"white"}
            fontFamily="Knewave"
            fontSize="100px"
            size="300px "
            margin={"20px"}
          >
            LASTPONG
          </Text>
        </div>
        <div>
          <Button
            fontFamily={"Knewave"}
            fontSize={40}
            textColor="white"
            bg={"#4267b2"}
            border="2px"
            height="74px"
            width={"200px"}
            borderRadius={"50"}
          >
            START
          </Button>
        </div>
      </Flex>
    </div>
  );
}

export default App;
