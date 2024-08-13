// src/app/Home.tsx
import React, { useState } from "react";
import { VStack, Heading, Text, useToast, Box } from "@chakra-ui/react";
import AudioRecorder from "../features/audioRecording/components/AudioRecorder";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/Button";
import TransformationSelector from "../components/TransformationSelector";
import TransformedTextDisplay from "../components/TransformedTextDisplay";
import { transcribeAudio, transformText } from "../api/openai";

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transformation, setTransformation] = useState<string>("summarize");
  const [transformedText, setTransformedText] = useState<string | null>(null);
  const toast = useToast();

  const handleRecordingStart = () => {
    setIsLoading(false);
    setError(null);
    setAudioBlob(null);
    setTranscription(null);
    setTransformedText(null);
    setIsRecording(true);
    toast({
      title: "Recording started",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleRecordingStop = () => {
    setIsRecording(false);
    toast({
      title: "Recording stopped",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
  };

  const handleRecordingError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
    setIsRecording(false);
  };

  const handleTranscribe = async () => {
    if (!audioBlob) {
      setError("No audio recording found. Please record audio first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Starting transcription...");
      const result = await transcribeAudio(audioBlob);
      console.log("Transcription result:", result);
      setTranscription(result);
      toast({
        title: "Transcription complete",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Transcription error:", err);
      let errorMessage = "Failed to transcribe audio";
      if (err instanceof Error) {
        errorMessage += `: ${err.message}`;
      }
      setError(errorMessage);
      toast({
        title: "Transcription failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransform = async () => {
    if (!transcription) {
      setError("No transcription available. Please transcribe audio first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Starting text transformation...");
      const result = await transformText(transcription, transformation);
      console.log("Transformation result:", result);
      setTransformedText(result);
      toast({
        title: "Text transformation complete",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Transformation error:", err);
      let errorMessage = "Failed to transform text";
      if (err instanceof Error) {
        errorMessage += `: ${err.message}`;
      }
      setError(errorMessage);
      toast({
        title: "Transformation failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
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
      <AudioRecorder
        isRecording={isRecording}
        onRecordingStart={handleRecordingStart}
        onRecordingStop={handleRecordingStop}
        onRecordingComplete={handleRecordingComplete}
        onError={handleRecordingError}
      />
      {audioBlob && !transcription && !isRecording && (
        <Button
          colorScheme="blue"
          size="lg"
          width="full"
          onClick={handleTranscribe}
          isLoading={isLoading}
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
          <Box mt={4}>
            <TransformationSelector
              value={transformation}
              onChange={setTransformation}
            />
            <Button
              colorScheme="green"
              size="lg"
              width="full"
              onClick={handleTransform}
              isLoading={isLoading}
              mt={2}
            >
              Transform Text
            </Button>
          </Box>
        </Box>
      )}
      {transformedText && <TransformedTextDisplay text={transformedText} />}
    </VStack>
  );
};

export default Home;
