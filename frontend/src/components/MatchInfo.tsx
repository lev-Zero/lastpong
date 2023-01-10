import { UserProps } from '@/interfaces/UserProps';
import { GameUserProps } from '@/interfaces/GameUserProps';
import { Box, Flex, HStack, Spacer, Text, VStack } from '@chakra-ui/react';
import CustomAvatar from './CustomAvatar';

interface MatchInfoProps {
  me: GameUserProps;
  opp: GameUserProps;
}

export default function MatchInfo({ me, opp }: MatchInfoProps) {
  return (
    <Box bg="white" borderRadius={20} p={5}>
      <Flex>
        <HStack padding={'10px'}>
          {/* <CustomAvatar url={""} size="md" /> */}
          <VStack>
            <Text fontSize="lg">{me.username}</Text>
            <Text fontSize="sm" color="main">{`RATING ${me.rating}`}</Text>
          </VStack>
        </HStack>
        <Spacer />
        <HStack padding={'10px'}>
          <VStack>
            <Text fontSize="lg">{opp.username}</Text>
            <Text fontSize="sm" color="opponent">{`RATING ${opp.rating}`}</Text>
          </VStack>
          {/* <CustomAvatar url={opp.imgUrl} size="md" /> */}
        </HStack>
      </Flex>
    </Box>
  );
}
