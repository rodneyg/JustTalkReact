import React from "react";
import { Box, Text, Heading } from "@chakra-ui/react";

interface TransformedTextDisplayProps {
  text: string;
}

const TransformedTextDisplay: React.FC<TransformedTextDisplayProps> = ({
  text,
}) => {
  return (
    <Box borderWidth={1} borderRadius="lg" p={4} bg="gray.50">
      <Heading size="md" mb={2}>
        Transformed Text:
      </Heading>
      <Text>{text}</Text>
    </Box>
  );
};

export default TransformedTextDisplay;
