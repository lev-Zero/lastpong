import React, { ReactNode } from "react";
import useLoginStore from "@/store/useLoginStore";
import { Flex, Text } from "@chakra-ui/react";

//토탈 승수와 패배수를 색깔 입혀 보여주는 컴포넌트
export default function WinLoseSum() {
    const { totalWin, totalLoss } = useLoginStore();

    return (
        <>
            <Flex flexDirection={"row"}>
                <Text color="green">WIN {totalWin} </Text>
                <Text>&nbsp; : &nbsp;</Text>
                <Text color="red"> {totalLoss} LOSE</Text>
            </Flex>
        </>
    );
}
