import { UserProps } from '@/interfaces/UserProps';
import { Box, Flex, HStack, Spacer, Text, VStack } from '@chakra-ui/react';
import CustomAvatar from './CustomAvatar';

interface MatchInfoProps {
  me: UserProps;
  opp: UserProps;
}

export default function MatchInfo({ me, opp }: MatchInfoProps) {
  return (
    <Box bg="white" borderRadius={20} p={5}>
      <Flex>
        <HStack>
          <CustomAvatar url={me.imgUrl} size="md" />
          <VStack>
            <Text fontSize="lg">{me.name.toUpperCase()}</Text>
            <Text fontSize="sm" color="main">{`RATING ${me.rating}`}</Text>
          </VStack>
        </HStack>
        <Spacer />
        <HStack>
          <VStack>
            <Text fontSize="lg">{opp.name.toUpperCase()}</Text>
            <Text fontSize="sm" color="opponent">{`RATING ${opp.rating}`}</Text>
          </VStack>
          <CustomAvatar url={opp.imgUrl} size="md" />
        </HStack>
      </Flex>
    </Box>
  );
}
