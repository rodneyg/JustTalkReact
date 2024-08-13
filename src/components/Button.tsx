// src/components/Button.tsx
import React from "react";
import { Button as ChakraButton, ButtonProps, Icon } from "@chakra-ui/react";

interface CustomButtonProps extends Omit<ButtonProps, "leftIcon"> {
  leftIcon?: React.ReactElement | string;
}

const Button: React.FC<CustomButtonProps> = ({
  children,
  leftIcon,
  ...props
}) => {
  const icon =
    typeof leftIcon === "string" ? (
      <Icon as={() => <span>{leftIcon}</span>} />
    ) : (
      leftIcon
    );

  return (
    <ChakraButton
      px={6}
      py={3}
      borderRadius="md"
      fontWeight="semibold"
      _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
      transition="all 0.2s"
      leftIcon={icon}
      {...props}
    >
      {children}
    </ChakraButton>
  );
};

export default Button;
