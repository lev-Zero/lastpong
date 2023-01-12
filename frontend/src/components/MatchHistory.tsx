import React, { useEffect, useState } from 'react';
import { Flex, HStack, Text } from '@chakra-ui/react';
import { MatchHistoryProps } from '@/interfaces/MatchProps';

export default function MatchHistory({
  user,
  winName,
  winScore,
  loseName,
  loseScore,
}: MatchHistoryProps) {
  const [oppName, setOppName] = useState<string>('');

  useEffect(() => {
    if (user.name === winName) {
      setOppName(loseName);
    } else {
      setOppName(winName);
    }
  }, [user]);

  return (
    <>
      <HStack>
        <Flex>
          <Text color={user.name === winName ? 'green' : 'red'}>{user.name.toUpperCase()}</Text>
          <Text color={'black'}>&nbsp; &nbsp;</Text>
          <Text color={user.name === winName ? 'green' : 'red'}>
            {user.name === winName ? winScore : loseScore}
          </Text>
        </Flex>

        <Flex>
          <Text color={'black'}>&nbsp; : &nbsp;</Text>
        </Flex>

        <Flex>
          <Text color={user.name === winName ? 'red' : 'green'}>
            {user.name === winName ? loseScore : winScore}
          </Text>
          <Text color={'black'}>&nbsp; &nbsp;</Text>
          <Text color={user.name === winName ? 'red' : 'green'}>{oppName.toUpperCase()}</Text>
        </Flex>
      </HStack>
    </>
  );
}
