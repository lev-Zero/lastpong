import React from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { MatchHistoryProps } from '@/interfaces/MatchProps';

export default function MatchHistory({ myName, myScore, oppName, oppScore }: MatchHistoryProps) {
  return (
    <Flex>
      <Text color={myScore > oppScore ? 'green' : myScore === oppScore ? 'black' : 'red'}>
        {myName.toUpperCase()} {myScore}
      </Text>
      <Text>&nbsp; : &nbsp;</Text>
      <Text>
        {oppScore} {oppName.toUpperCase()}
      </Text>
    </Flex>
  );
}
