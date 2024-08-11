// src/components/Button.tsx
import React from "react";
import { Button as ChakraButton, ButtonProps } from "@chakra-ui/react";

interface CustomButtonProps extends ButtonProps {
  // Add any custom props here
}

const Button: React.FC<CustomButtonProps> = ({ children, ...props }) => {
  return (
    <ChakraButton
      px={6}
      py={3}
      borderRadius="md"
      fontWeight="semibold"
      _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
      transition="all 0.2s"
      {...props}
    >
      {children}
    </ChakraButton>
  );
};

export default Button;
