// import {
//   Alert,
//   AlertIcon,
//   AlertTitle,
//   AlertDescription,
//   Box,
//   CloseButton,
//   useDisclosure,
// } from '@/chakra-ui/react';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  CloseButton,
  useDisclosure,
} from '@chakra-ui/react';

interface AlertProps {
  status: String;
  title: string;
  msg: string;
  onOpen?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
}
/*
status  는 error success warning info  중 하나

*/
export default function CustomAlert({ status, title, msg, onOpen, onClose, isOpen }: AlertProps) {
  // const { isOpen, onClose, onOpen } = useDisclosure({ defaultIsOpen: true });

  return (
    <Alert status={status}>
      <AlertIcon />
      <Box>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{msg}</AlertDescription>
      </Box>
      <CloseButton
        alignSelf="flex-start"
        position="relative"
        right={-1}
        top={-1}
        onClick={onClose}
      />
    </Alert>
  );
}
