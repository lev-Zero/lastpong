import { UserProps, UserStatus } from '@/interfaces/UserProps';
import { Menu, MenuItem, MenuList, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';

export interface OptionMenuProps {
  user: UserProps;
  isFriend: boolean;
  isBlocked: boolean;
}

export function OptionMenu({ user, isFriend, isBlocked }: OptionMenuProps) {
  return (
    <MenuList>
      <MenuItem as={Link} href={`/user/${user.name}`}>
        VIEW PROFILE
      </MenuItem>
      {user.status === UserStatus.online ? (
        <MenuItem>INVITE TO GAME</MenuItem>
      ) : (
        <MenuItem>
          <Text color="gray.200">INVITE TO GAME</Text>
        </MenuItem>
      )}
      {!isFriend ? (
        <MenuItem>
          <Text
            color="win"
            onClick={() => {
              console.log('add friend');
            }}
          ></Text>
          ADD FRIEND
        </MenuItem>
      ) : (
        <MenuItem>
          <Text
            color="red"
            onClick={() => {
              console.log('delete friend');
            }}
          >
            DELETE FRIEND
          </Text>
        </MenuItem>
      )}
      {!isBlocked ? (
        <MenuItem>
          <Text color="red">BLOCK</Text>
        </MenuItem>
      ) : (
        <MenuItem>
          <Text color="black">UNBLOCK</Text>
        </MenuItem>
      )}
    </MenuList>
  );
}
