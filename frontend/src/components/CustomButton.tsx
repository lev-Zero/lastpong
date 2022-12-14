import { Button } from '@chakra-ui/react';
import { ReactNode } from 'react';

export interface CustomButtonProps {
  children: ReactNode;
  size: string;
  isDisabled?: boolean;
  btnStyle?: object;
  onClick: () => void;
}

export function CustomButton({
  children,
  size,
  isDisabled = false,
  onClick,
  btnStyle,
}: CustomButtonProps) {
  const [bg, color]: [string, string] = !isDisabled ? ['main', 'white'] : ['gray.200', '#AAAAAA'];

  if (size === 'xl') {
    return (
      <Button
        fontSize="3xl"
        p={10}
        bg={bg}
        color={color}
        border="2px"
        borderColor="white"
        borderRadius="4242"
        disabled={isDisabled}
        style={btnStyle}
        onClick={onClick}
      >
        {children}
      </Button>
    );
  }
  if (size === '2xl') {
    return (
      <Button
        fontSize="6xl"
        p={16}
        bg={bg}
        color={color}
        border="2px"
        borderColor="white"
        borderRadius="4242"
        disabled={isDisabled}
        style={btnStyle}
        onClick={onClick}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      w={120}
      bg={bg}
      color={color}
      border="2px"
      borderColor="white"
      borderRadius="4242"
      size={size}
      disabled={isDisabled}
      style={btnStyle}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
