// src/features/audioRecording/components/AudioRecorder.tsx
import React, { useState, useEffect } from "react";
import { VStack, Box, Text } from "@chakra-ui/react";
import useAudioRecording from "../hooks/useAudioRecording";
import Button from "../../../components/Button";

interface AudioRecorderProps {
  onRecordingStart: () => void;
  onError: (error: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingStart,
  onError,
}) => {
  const { isRecording, startRecording, stopRecording, audioBlob } =
    useAudioRecording();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleStartRecording = () => {
    startRecording().catch((error) => {
      onError(error.message);
    });
    onRecordingStart();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    }
  }, [audioBlob]);

  return (
    <VStack spacing={4} align="stretch">
      <Button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        colorScheme={isRecording ? "red" : "green"}
        leftIcon={isRecording ? "⏹️" : "🎙️"}
        size="lg"
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>
      {isRecording && (
        <Text textAlign="center" fontWeight="bold" color="red.500">
          Recording in progress...
        </Text>
      )}
      {audioUrl && (
        <Box borderWidth={1} borderRadius="lg" p={4} bg="gray.50">
          <Text mb={2} fontWeight="semibold">
            Your Recording:
          </Text>
          <audio controls src={audioUrl} style={{ width: "100%" }}>
            Your browser does not support the audio element.
          </audio>
        </Box>
      )}
    </VStack>
  );
};

export default AudioRecorder;
