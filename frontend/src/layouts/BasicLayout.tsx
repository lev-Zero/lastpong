import { ReactNode } from 'react';
import { Center, VStack } from '@chakra-ui/react';

type BasicLayoutProps = {
  children: ReactNode;
};

export default function BasicLayout({ children }: BasicLayoutProps) {
  return (
    <Center bg="main" color="white">
      <VStack>{children}</VStack>
    </Center>
  );
}
