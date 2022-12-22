import { Button } from '@chakra-ui/react';
import { ReactNode } from 'react';

export interface CustomButtonProps {
  children: ReactNode;
  size: string;
  isDisabled?: boolean;
  onClick: () => void;
}

export function CustomButton({ children, size, isDisabled = false, onClick }: CustomButtonProps) {
  const [bg, color]: [string, string] = !isDisabled ? ['main', 'white'] : ['gray.200', '#AAAAAA'];

  return (
    <Button
      w={120}
      bg={bg}
      color={color}
      border="2px"
      borderColor="white"
      borderRadius="42"
      size={size}
      disabled={isDisabled}
      onClick={onClick}>
      {children}
    </Button>
  );
}
