// src/features/audioRecording/components/AudioRecorder.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  VStack,
  Box,
  Text,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import useAudioRecording from "../hooks/useAudioRecording";
import Button from "../../../components/Button";
import { DownloadIcon } from "@chakra-ui/icons";

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
  const { startRecording, stopRecording, audioBlob, audioMimeType } =
    useAudioRecording();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  console.log(
    "AudioRecorder rendering, isRecording:",
    isRecording,
    "isConfirmOpen:",
    isConfirmOpen,
  );

  const handleToggleRecording = useCallback(() => {
    console.log(`handleToggleRecording called. isRecording: ${isRecording}`);
    if (isRecording) {
      console.log("Attempting to open confirm dialog");
      setIsConfirmOpen(true);
      console.log(`isConfirmOpen set to: ${true}`);
    } else {
      console.log("Starting recording...");
      startRecording()
        .then(() => {
          console.log("Recording started successfully");
          onRecordingStart();
        })
        .catch((error: Error) => {
          console.error("Error starting recording:", error);
          onError(error.message);
        });
    }
  }, [isRecording, startRecording, onRecordingStart, onError]);

  const handleConfirmStop = useCallback(() => {
    console.log("Confirm stop: Stopping recording...");
    stopRecording();
    onRecordingStop();
    setIsConfirmOpen(false);
  }, [stopRecording, onRecordingStop]);

  const handleDownload = useCallback(() => {
    if (audioBlob && audioUrl) {
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = `recording_${new Date().toISOString()}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [audioBlob, audioUrl]);

  useEffect(() => {
    console.log(`isRecording changed to: ${isRecording}`);
  }, [isRecording]);

  useEffect(() => {
    console.log(`isConfirmOpen changed to: ${isConfirmOpen}`);
  }, [isConfirmOpen]);

  useEffect(() => {
    if (audioBlob) {
      console.log(
        `Audio recorded: ${audioBlob.size} bytes, MIME type: ${audioMimeType}`,
      );
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      onRecordingComplete(audioBlob);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioBlob, audioMimeType, onRecordingComplete]);

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
          <Button
            leftIcon={<DownloadIcon />}
            colorScheme="blue"
            mt={2}
            onClick={handleDownload}
          >
            Download Recording
          </Button>
        </Box>
      )}

      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          console.log("AlertDialog onClose called");
          setIsConfirmOpen(false);
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Stop Recording
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to stop recording? This action cannot be
              undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => {
                  console.log("Cancel button clicked");
                  setIsConfirmOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  console.log("Confirm stop button clicked");
                  handleConfirmStop();
                }}
                ml={3}
              >
                Stop Recording
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default AudioRecorder;
