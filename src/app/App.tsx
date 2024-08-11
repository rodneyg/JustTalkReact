// src/app/app.tsx
import React from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Home from "./Home";
import Layout from "../components/Layout";

const theme = extendTheme({
  // Add any custom theme configurations here
});

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <Layout>
        <Home />
      </Layout>
    </ChakraProvider>
  );
};

export default App;
