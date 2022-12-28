import { ReactNode } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Box, Flex } from '@chakra-ui/react';

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box h="100%">
      <Header />
      <Flex bg="gray.200" h="90%">
        <Box w="80%">{children}</Box>
        <Box w="20%" mr={'25px'}>
          <Sidebar />
        </Box>
      </Flex>
    </Box>
  );
}
