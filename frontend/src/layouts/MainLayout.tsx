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
        <Box flexGrow={4}>{children}</Box>
        <Box flexGrow={1}>
          <Sidebar />
        </Box>
      </Flex>
    </Box>
  );
}
