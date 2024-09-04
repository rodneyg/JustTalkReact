// src/app/Home.tsx
import React, { useState, useCallback } from "react";
import {
  VStack,
  Heading,
  Text,
  useToast,
  Box,
  HStack,
  Progress,
} from "@chakra-ui/react";
import AudioRecorder from "../features/audioRecording/components/AudioRecorder";
import ErrorMessage from "../components/ErrorMessage";
import Button from "../components/Button";
import TransformationSelector from "../components/TransformationSelector";
import { transcribeAudio, transformText } from "../api/openai";
import useAudioRecording from "../features/audioRecording/hooks/useAudioRecording";

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const { chunkAudio, audioMimeType } = useAudioRecording();
  const [transformation, setTransformation] = useState<string>("summarize");
  const [transformedText, setTransformedText] = useState<string | null>(null);
  const [hasAttemptedTranscription, setHasAttemptedTranscription] =
    useState(false);
  const toast = useToast();

  const handleRecordingStart = useCallback(() => {
    console.log("Recording started");
    setIsLoading(false);
    setIsRecording(true);
    setError(null);
    setAudioBlob(null);
    setTranscription(null);
    setTransformedText(null);
    setHasAttemptedTranscription(false);
    toast({
      title: "Recording started",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const handleRecordingStop = useCallback(() => {
    console.log("Recording stopped");
    setIsRecording(false);
    toast({
      title: "Recording stopped",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const handleRecordingComplete = useCallback(
    (blob: Blob) => {
      console.log(
        `Recording completed: ${blob.size} bytes, MIME type: ${audioMimeType}`,
      );
      setAudioBlob(blob);
    },
    [audioMimeType],
  );

  const handleRecordingError = useCallback((errorMessage: string) => {
    console.error("Recording error:", errorMessage);
    setError(errorMessage);
    setIsLoading(false);
  }, []);

  const handleTranscribe = useCallback(async () => {
    if (!audioBlob) {
      console.error("No audio recording found");
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
      console.log(`Audio chunked into ${chunks.length} parts`);
      let fullTranscription = "";

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`Transcribing chunk ${i + 1}/${chunks.length}`);
        // Always use 'audio/wav' for transcription, as we've converted chunks to WAV
        const result = await transcribeAudio(chunk, "audio/wav");
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
  }, [audioBlob, chunkAudio, toast]);

  const handleTransform = useCallback(async () => {
    if (!transcription) {
      console.error("No transcription available");
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
  }, [transcription, transformation, toast]);

  const copyToClipboard = useCallback(
    (text: string, type: "transcription" | "transformation") => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log(`${type} copied to clipboard`);
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
    },
    [toast],
  );

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
      {audioBlob && (
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
