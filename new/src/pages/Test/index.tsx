import React from "react";
import { Avatar, Flex, Box, Text, Image, Button } from "@chakra-ui/react";
import useLoginStore from "../../store/useLoginStore";
import { ThemaHeader } from "../../UI/atoms/ThemaHeader";
import "./index.css";
import { FlatTree } from "framer-motion";
import { ThemaButton } from "../../UI/atoms/ThemaButton";

export function Test() {
  const { name, avatarImg } = useLoginStore();

  return (
    <Flex flexDir={"column"}>
      <ThemaHeader />
      <Flex width={"100%"} height={"93vh"} bg={"#999999"}>
        <Flex
          width={"77%"}
          height={"100%"}
          bg={"green.100"}
          flexDir={"column"}
          alignContent={"center"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Flex width={"80%"} height={"90%"} bg={"white"} borderRadius={"20"}>
            <Image src={process.env.PUBLIC_URL + "/HowToPlay.png"} />
          </Flex>
          <Button
            position={"absolute"}
            left={"32%"}
            top={"76%"}
            fontFamily={"Knewave"}
            fontSize={40}
            textColor="white"
            bg={"#4267b2"}
            border="2px"
            height="74px"
            width={"200px"}
            margin={5}
            borderRadius={"50"}
          >
            START
          </Button>
        </Flex>
        {/* Friends */}
        <Flex
          width={"23%"}
          height={"100%"}
          bg={"red.100"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Flex width={"94%"} height={"96%"} bg={"white"} borderRadius={20}>
            <Flex width={"100%"} height={"8%"}>
              <Flex width={"85%"} alignContent={"center"}>
                <Text
                  fontFamily={"Knewave"}
                  fontSize={"30px"}
                  marginTop={"13px"}
                  marginLeft={"30px"}
                >
                  Friends
                </Text>
              </Flex>
              <Flex
                flexDir={"column"}
                alignContent={"center"}
                justifyContent={"center"}
              >
                <Image
                  src={process.env.PUBLIC_URL + "/searchButton.png"}
                  boxSize={"35px"}
                />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
