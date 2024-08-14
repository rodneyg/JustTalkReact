// src/features/audioRecording/hooks/useAudioRecording.ts
import { useState, useCallback } from "react";

const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );

  const chunkAudio = async (
    audioBlob: Blob,
    chunkDuration: number = 30,
  ): Promise<Blob[]> => {
    const audioBuffer = await audioBlob.arrayBuffer();
    const audio = new AudioContext();
    const audioSource = await audio.decodeAudioData(audioBuffer);

    const chunks: Blob[] = [];
    const chunkSize = audio.sampleRate * chunkDuration;

    for (let i = 0; i < audioSource.length; i += chunkSize) {
      const chunk = audioSource.slice(i, i + chunkSize);
      const chunkBlob = new Blob([chunk], { type: audioBlob.type });
      chunks.push(chunkBlob);
    }

    return chunks;
  };

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
