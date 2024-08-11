// src/app/Home.tsx
import React, { useState } from "react";
import { VStack, Heading, useToast } from "@chakra-ui/react";
import AudioRecorder from "../features/audioRecording/components/AudioRecorder";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";

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
    <VStack spacing={4} align="stretch">
      <Heading>JustTalk</Heading>
      {error && <ErrorMessage title="Error" description={error} />}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <AudioRecorder
          onRecordingStart={handleRecordingStart}
          onError={handleRecordingError}
        />
      )}
    </VStack>
  );
};

export default Home;
