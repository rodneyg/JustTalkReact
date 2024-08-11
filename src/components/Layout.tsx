// src/components/Layout.tsx
import React from "react";
import { Box, Container, VStack } from "@chakra-ui/react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box minHeight="100vh" bg="gray.50">
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="stretch">
          {children}
        </VStack>
      </Container>
    </Box>
  );
};

export default Layout;
