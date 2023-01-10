import React from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { MatchHistoryProps } from '@/interfaces/MatchProps';

export default function MatchHistory({
  winName,
  winScore,
  loseName,
  loseScore,
}: MatchHistoryProps) {
  return (
    <Flex>
      <Text color={'green'}>
        {winName.toUpperCase()} {winScore}
      </Text>
      <Text color={'black'}>&nbsp; : &nbsp;</Text>
      <Text color={'red'}>
        {loseScore} {loseName.toUpperCase()}
      </Text>
    </Flex>
  );
}
