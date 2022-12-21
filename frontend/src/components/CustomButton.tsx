import { Button } from '@chakra-ui/react';
import { ReactNode } from 'react';

export interface CustomButtonProps {
  children: ReactNode;
  size: string;
  isDisabled?: boolean;
  onClick: () => void;
}

export function CustomButton({ children, size, isDisabled = false, onClick }: CustomButtonProps) {
  const [bg, color]: [string, string] = !isDisabled ? ['main', 'white'] : ['gray', '#AAAAAA'];

  return (
    <Button
      bg={bg}
      color={color}
      borderRadius="42"
      size={size}
      disabled={isDisabled}
      onClick={onClick}>
      {children}
    </Button>
  );
}
