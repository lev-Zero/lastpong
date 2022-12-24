import { UserProps } from '@/interfaces/UserProps';
import { Box, Circle, Flex, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { ContextMenu } from 'chakra-ui-contextmenu';
import Link from 'next/link';
import CustomAvatar from './CustomAvatar';
import { OptionMenu } from './OptionMenu';

interface UserItemProps {
  user: UserProps;
  msgNum?: number;
}

export default function UserItem({ user, msgNum }: UserItemProps) {
  return (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <OptionMenu user={user} isFriend={true} isBlocked={false} />}
    >
      {(ref) => (
        <Box ref={ref} w="100%" position="relative" px={3} py={1}>
          <Link href={`/user/${user.name}`}>
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
          </Link>
        </Box>
      )}
    </ContextMenu>
  );
}
