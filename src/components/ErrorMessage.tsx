// src/components/ErrorMessage.tsx
import React from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

interface ErrorMessageProps {
  title: string;
  description?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ title, description }) => {
  return (
    <Alert status="error">
      <AlertIcon />
      <AlertTitle mr={2}>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  );
};

export default ErrorMessage;
