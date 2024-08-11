// src/app/Home.tsx
import React, { useState } from "react";
import { VStack, Heading, Text, useToast, Box } from "@chakra-ui/react";
import AudioRecorder from "../features/audioRecording/components/AudioRecorder";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/Button";
import { transcribeAudio } from "../api/openai"; // Import the transcribeAudio function

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const toast = useToast();

  const handleRecordingStart = () => {
    setIsLoading(true);
    setError(null);
    setAudioBlob(null);
    setTranscription(null); // Reset transcription when starting a new recording
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

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
  };

  const handleRecordingError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await transcribeAudio(audioBlob);
      setTranscription(result);
      toast({
        title: "Transcription complete",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      setError("Failed to transcribe audio");
      toast({
        title: "Transcription failed",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
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
          onRecordingComplete={handleRecordingComplete}
          onError={handleRecordingError}
        />
      )}
      {audioBlob && !transcription && (
        <Button
          colorScheme="blue"
          size="lg"
          width="full"
          onClick={handleTranscribe}
        >
          Transcribe Audio
        </Button>
      )}
      {transcription && (
        <Box>
          <Heading size="md" mb={2}>
            Transcription:
          </Heading>
          <Text>{transcription}</Text>
        </Box>
      )}
    </VStack>
  );
};

export default Home;
