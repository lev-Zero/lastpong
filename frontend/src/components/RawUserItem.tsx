import { Circle, Flex, Text } from '@chakra-ui/react';
import CustomAvatar from './CustomAvatar';
import RawUserItemProps from '@/interfaces/RawUserItemProps';

export default function RawUserItem({ user, msgNum }: RawUserItemProps) {
  return (
    <>
      {msgNum !== undefined && msgNum !== 0 ? (
        <Circle
          position="absolute"
          size="40px"
          transform="translate(-30%, -30%)"
          bg="#FF3D00"
          color="white"
        >
          {msgNum}
        </Circle>
      ) : null}
      <Flex
        w="100%"
        justifyContent="space-around"
        alignItems="center"
        p={4}
        bg="gray.100"
        border="2px"
        borderRadius={20}
      >
        <CustomAvatar url={user.imgUrl} size="md" status={user.status} />
        <Text>{user.name.toUpperCase()}</Text>
      </Flex>
    </>
  );
}
