// src/features/audioRecording/components/AudioRecorder.tsx
import React, { useState, useEffect } from "react";
import { VStack, Box, Text } from "@chakra-ui/react";
import useAudioRecording from "../hooks/useAudioRecording";
import Button from "../../../components/Button";

interface AudioRecorderProps {
  isRecording: boolean;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
  onRecordingComplete: (blob: Blob) => void;
  onError: (error: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  isRecording,
  onRecordingStart,
  onRecordingStop,
  onRecordingComplete,
  onError,
}) => {
  const { startRecording, stopRecording, audioBlob } = useAudioRecording();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
      onRecordingStop();
    } else {
      startRecording()
        .then(() => {
          onRecordingStart();
        })
        .catch((error: Error) => {
          onError(error.message);
        });
    }
  };

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      onRecordingComplete(audioBlob);
    }
  }, [audioBlob, onRecordingComplete]);

  return (
    <VStack spacing={4} align="stretch">
      <Button
        onClick={handleToggleRecording}
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
      {audioUrl && !isRecording && (
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
