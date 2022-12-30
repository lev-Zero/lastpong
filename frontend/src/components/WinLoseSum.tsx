import React, { ReactNode } from 'react';
import { Flex, Text } from '@chakra-ui/react';

interface WinLoseSumProps {
  winCnt: number;
  loseCnt: number;
  fontSize?: string;
}

export default function WinLoseSum({ winCnt, loseCnt, fontSize = 'md' }: WinLoseSumProps) {
  return (
    <>
      <Flex fontSize={fontSize}>
        <Text color="win">WIN {winCnt} </Text>
        <Text>&nbsp; : &nbsp;</Text>
        <Text color="lose"> {loseCnt} LOSE</Text>
      </Flex>
    </>
  );
}
