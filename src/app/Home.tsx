// src/app/Home.tsx
import React, { useState } from "react";
import { VStack, Heading, Text, useToast, Box, HStack } from "@chakra-ui/react";
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
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const { chunkAudio } = useAudioRecording();
  const [transformation, setTransformation] = useState<string>("summarize");
  const [transformedText, setTransformedText] = useState<string | null>(null);
  const [hasAttemptedTranscription, setHasAttemptedTranscription] =
    useState(false);
  const toast = useToast();

  const handleRecordingStart = () => {
    setIsLoading(false);
    setError(null);
    setAudioBlob(null);
    setTranscription(null);
    setTransformedText(null);
    setHasAttemptedTranscription(false);
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
    setTranscription(null);
    setTransformedText(null);
    setTranscriptionProgress(0);

    try {
      console.log("Starting transcription...");
      const chunks = await chunkAudio(audioBlob);
      let fullTranscription = "";

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const result = await transcribeAudio(chunk);
        fullTranscription += result + " ";
        setTranscriptionProgress(((i + 1) / chunks.length) * 100);
      }

      console.log("Transcription result:", fullTranscription);
      setTranscription(fullTranscription.trim());
      setHasAttemptedTranscription(true);
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

  const copyToClipboard = (
    text: string,
    type: "transcription" | "transformation",
  ) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: `${type === "transcription" ? "Transcription" : "Transformed text"} copied`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast({
          title: "Failed to copy text",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      });
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
      {audioBlob && !isRecording && (
        <Button
          colorScheme="blue"
          size="lg"
          width="full"
          onClick={handleTranscribe}
          isLoading={isLoading}
        >
          {hasAttemptedTranscription
            ? "Retry Transcription"
            : "Transcribe Audio"}
        </Button>
      )}
      {isLoading && (
        <VStack>
          <Text>Transcribing: {transcriptionProgress.toFixed(0)}%</Text>
          <Progress value={transcriptionProgress} width="100%" />
        </VStack>
      )}
      {transcription && (
        <Box>
          <HStack justify="space-between" align="center" mb={2}>
            <Heading size="md">Transcription:</Heading>
            <Text fontSize="sm" color="gray.500">
              {transcription.length} characters
            </Text>
            <Button
              size="sm"
              onClick={() => copyToClipboard(transcription, "transcription")}
            >
              Copy
            </Button>
          </HStack>
          <Box
            maxHeight="200px"
            overflowY="auto"
            borderWidth={1}
            borderRadius="md"
            p={2}
          >
            <Text>{transcription}</Text>
          </Box>
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
      {transformedText && (
        <Box>
          <HStack justify="space-between" align="center" mb={2}>
            <Heading size="md">Transformed Text:</Heading>
            <Text fontSize="sm" color="gray.500">
              {transformedText.length} characters
            </Text>
            <Button
              size="sm"
              onClick={() => copyToClipboard(transformedText, "transformation")}
            >
              Copy
            </Button>
          </HStack>
          <Box
            maxHeight="200px"
            overflowY="auto"
            borderWidth={1}
            borderRadius="md"
            p={2}
          >
            <Text>{transformedText}</Text>
          </Box>
        </Box>
      )}
    </VStack>
  );
};

export default Home;
