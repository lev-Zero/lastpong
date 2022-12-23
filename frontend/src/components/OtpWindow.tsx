import {
    Flex,
    Image,
    VStack,
    HStack,
    PinInput,
    PinInputField,
} from "@chakra-ui/react";

export default function OtpWindow() {
    return (
        <Flex border={"2px"} p={"20"} borderRadius={"20%"}>
            <VStack>
                <Image
                    border={"2px"}
                    borderColor={"black"}
                    src="data:image/png;base64,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"
                />
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
