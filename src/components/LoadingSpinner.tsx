// src/components/LoadingSpinner.tsx
import React from "react";
import { Spinner, Center } from "@chakra-ui/react";

interface LoadingSpinnerProps {
  size?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "xl" }) => {
  return (
    <Center>
      <Spinner size={size} />
    </Center>
  );
};

export default LoadingSpinner;
