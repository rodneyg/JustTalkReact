// src/features/audioRecording/hooks/useAudioRecording.ts
import { useState, useCallback } from "react";

const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );

  const startRecording = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const recorder = new MediaRecorder(stream);
          setMediaRecorder(recorder);

          recorder.ondataavailable = (event) => {
            setAudioBlob(event.data);
          };

          recorder.onstart = () => {
            setIsRecording(true);
          };

          recorder.onstop = () => {
            setIsRecording(false);
            stream.getTracks().forEach((track) => track.stop());
          };

          recorder.start();
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  }, [mediaRecorder]);

  return { isRecording, startRecording, stopRecording, audioBlob };
};

export default useAudioRecording;
