import React, { useEffect, useState } from 'react';
import { Center, Flex, HStack, Spacer, Text } from '@chakra-ui/react';
import { MatchHistoryProps } from '@/interfaces/MatchProps';
import { useRouter } from 'next/router';

export default function MatchHistory({
  winName,
  winScore,
  loseName,
  loseScore,
}: MatchHistoryProps) {
  const [myName, setMyName] = useState<string>('');
  const [oppName, setOppName] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const query = router.query.username;
    if (query === undefined || typeof query === 'object') {
      return;
    }
    setMyName(query);
    // console.log('query', router.query.username);
  }, []);

  useEffect(() => {
    if (myName === winName) {
      setOppName(loseName);
    } else {
      setOppName(winName);
    }
  }, [myName]);

  return (
    <>
      <HStack>
        <Flex>
          <Text color={myName === winName ? 'green' : 'red'}>{myName.toUpperCase()}</Text>
          <Text color={'black'}>&nbsp; &nbsp;</Text>
          <Text color={myName === winName ? 'green' : 'red'}>
            {myName === winName ? winScore : loseScore}
          </Text>
        </Flex>

        <Flex>
          <Text color={'black'}>&nbsp; : &nbsp;</Text>
        </Flex>

        <Flex>
          <Text color={myName === winName ? 'red' : 'green'}>
            {myName === winName ? loseScore : winScore}
          </Text>
          <Text color={'black'}>&nbsp; &nbsp;</Text>
          <Text color={myName === winName ? 'red' : 'green'}>{oppName.toUpperCase()}</Text>
        </Flex>
      </HStack>
    </>
  );
}
