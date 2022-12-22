import { UserProps } from '@/interfaces/UserProps';
import { Box, Circle, Flex, Text } from '@chakra-ui/react';
import CustomAvatar from './CustomAvatar';

interface UserItemProps {
  user: UserProps;
  msgNum: number;
}

export default function UserItem({ user, msgNum }: UserItemProps) {
  return (
    <Box w="100%" position="relative" my={2} px={3} py={1}>
      <Circle
        position="absolute"
        size="40px"
        transform="translate(-30%, -30%)"
        bg="#FF3D00"
        color="white">
        {msgNum}
      </Circle>
      <Flex
        w="100%"
        justifyContent="space-around"
        alignItems="center"
        p={4}
        bg="gray.100"
        border="2px"
        borderRadius={20}>
        <CustomAvatar url={user.imgUrl} size="md" status={user.status} />
        <Text>{user.name.toUpperCase()}</Text>
      </Flex>
    </Box>
  );
}
