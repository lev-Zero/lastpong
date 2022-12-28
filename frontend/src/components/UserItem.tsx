import {
  Box,
  HStack,
  Popover,
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
import RawUserItemProps from '@/interfaces/RawUserItemProps';
import RawUserItem from './RawUserItem';

function PopoverHoc({ user, msgNum }: RawUserItemProps) {
  return (
    <Popover placement="left">
      <PopoverTrigger>
        <Box>
          <RawUserItem user={user} msgNum={msgNum} />
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

export default function ContextMenuHoc({ user, msgNum }: RawUserItemProps) {
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
