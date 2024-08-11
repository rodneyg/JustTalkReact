// src/features/audioRecording/components/AudioRecorder.tsx
import React, { useState, useEffect } from "react";
import { Button, VStack, Box } from "@chakra-ui/react";
import useAudioRecording from "../hooks/useAudioRecording";

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
    <VStack spacing={4}>
      <Button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        colorScheme={isRecording ? "red" : "blue"}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>
      {audioUrl && (
        <Box width="100%">
          <audio controls src={audioUrl} style={{ width: "100%" }}>
            Your browser does not support the audio element.
          </audio>
        </Box>
      )}
    </VStack>
  );
};

export default AudioRecorder;
