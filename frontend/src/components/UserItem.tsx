import { UserProps } from '@/interfaces/UserProps';
import {
  Box,
  Button,
  Circle,
  Flex,
  HStack,
  MenuItem,
  MenuList,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Text,
} from '@chakra-ui/react';
import { ContextMenu } from 'chakra-ui-contextmenu';
import CustomAvatar from './CustomAvatar';
import { OptionMenu } from './OptionMenu';

interface UserItemProps {
  user: UserProps;
  msgNum?: number;
}

function UserItem({ user, msgNum }: UserItemProps) {
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

function PopoverHoc({ user, msgNum }: UserItemProps) {
  return (
    <Popover placement="left">
      <PopoverTrigger>
        <Box>
          <UserItem user={user} msgNum={msgNum} />
        </Box>
      </PopoverTrigger>
      <Portal>
        <PopoverContent borderRadius="20">
          <PopoverCloseButton />
          <PopoverHeader borderTopRadius="20" p="3" bg="main" color="white">
            <HStack spacing="5">
              <CustomAvatar url={user.imgUrl} size="md" status={user.status} />
              <Text fontSize="xl">{user.name.toUpperCase()}</Text>
            </HStack>
          </PopoverHeader>
          <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}

export default function ContextMenuHoc({ user, msgNum }: UserItemProps) {
  return (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <OptionMenu user={user} isFriend={true} isBlocked={false} />}
    >
      {(ref) => (
        <Box ref={ref} w="100%" position="relative" px={3} py={1}>
          <PopoverHoc user={user} msgNum={msgNum} />
        </Box>
      )}
    </ContextMenu>
  );
}
