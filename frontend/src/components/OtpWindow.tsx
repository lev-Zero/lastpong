import {
  Flex,
  Image,
  VStack,
  HStack,
  PinInput,
  PinInputField,
} from "@chakra-ui/react";

interface OtpWindowProps {
  src: string;
}

export default function OtpWindow({ src }: OtpWindowProps) {
  return (
    <Flex border={"2px"} p={"20"} borderRadius={"20%"}>
      <VStack>
        <Image border={"2px"} borderColor={"black"} src={src} />
        <HStack p={10}>
          <PinInput otp>
            <PinInputField bg={"white"} color={"black"} />
            <PinInputField bg={"white"} color={"black"} />
            <PinInputField bg={"white"} color={"black"} />
            <PinInputField bg={"white"} color={"black"} />
            <PinInputField bg={"white"} color={"black"} />
            <PinInputField bg={"white"} color={"black"} />
          </PinInput>
        </HStack>
      </VStack>
    </Flex>
  );
}
