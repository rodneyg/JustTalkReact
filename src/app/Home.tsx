// src/app/Home.tsx
import React, { useState } from "react";
import { VStack, Heading, Text, useToast, Box } from "@chakra-ui/react";
import AudioRecorder from "../features/audioRecording/components/AudioRecorder";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/Button";

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleRecordingStart = () => {
    setIsLoading(true);
    setError(null);
    // Simulating an async operation
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Recording started",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }, 1000);
  };

  const handleRecordingError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  return (
    <VStack spacing={8} align="stretch">
      <Box textAlign="center">
        <Heading as="h1" size="2xl" mb={2}>
          JustTalk
        </Heading>
        <Text fontSize="xl" color="gray.600">
          Your AI-powered audio assistant
        </Text>
      </Box>
      {error && <ErrorMessage title="Error" description={error} />}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <AudioRecorder
          onRecordingStart={handleRecordingStart}
          onError={handleRecordingError}
        />
      )}
      <Button colorScheme="blue" size="lg" width="full">
        Transcribe Audio
      </Button>
    </VStack>
  );
};

export default Home;
