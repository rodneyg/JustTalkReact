// src/features/audioRecording/hooks/useAudioRecording.ts
import { useState, useCallback, useRef } from "react";
import { getNetworkType, getChunkDuration } from "../../../utils/networkUtils";

const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [audioMimeType, setAudioMimeType] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = useCallback((): Promise<void> => {
    console.log("Starting audio recording...");
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          let mimeType = "";
          const supportedMimeTypes = [
            "audio/webm",
            "audio/mp4",
            "audio/wav",
            "audio/ogg",
            "audio/aac",
            "audio/mpeg",
          ];

          for (const type of supportedMimeTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
              mimeType = type;
              break;
            }
          }

          if (!mimeType) {
            console.warn(
              "No supported MIME types found. Falling back to default.",
            );
            mimeType = "";
          }

          console.log(`Using MIME type: ${mimeType || "default"}`);
          setAudioMimeType(mimeType);

          const recorder = new MediaRecorder(
            stream,
            mimeType ? { mimeType } : undefined,
          );
          setMediaRecorder(recorder);

          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.current.push(event.data);
            }
          };

          recorder.onstart = () => {
            console.log("MediaRecorder started");
            setIsRecording(true);
            audioChunks.current = [];
          };

          recorder.onstop = () => {
            console.log("MediaRecorder stopped");
            setIsRecording(false);
            const blob = new Blob(audioChunks.current, {
              type: mimeType || "audio/wav",
            });
            console.log(
              `Received audio data: ${blob.size} bytes, MIME type: ${blob.type}`,
            );
            setAudioBlob(blob);
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            stream.getTracks().forEach((track) => track.stop());
          };

          recorder.start();
          resolve();
        })
        .catch((error) => {
          console.error("Error accessing microphone:", error);
          reject(error);
        });
    });
  }, []);

  const stopRecording = useCallback(() => {
    console.log("Stopping audio recording...");
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  }, [mediaRecorder]);

  const handleToggleRecording = useCallback(() => {
    console.log("handleToggleRecording called, isRecording:", isRecording);
    if (isRecording) {
      console.log("Attempting to open confirm dialog");
      setIsConfirmOpen(true);
      console.log("isConfirmOpen set to true");
    } else {
      console.log("Starting new recording");
      startRecording().catch((error) =>
        console.error("Error starting recording:", error),
      );
    }
  }, [isRecording, startRecording]);

  const handleConfirmStop = useCallback(() => {
    console.log("handleConfirmStop called");
    stopRecording();
    setIsConfirmOpen(false);
    console.log("isConfirmOpen set to false");
  }, [stopRecording]);

  const cancelStopRecording = useCallback(() => {
    console.log("cancelStopRecording called");
    setIsConfirmOpen(false);
    console.log("isConfirmOpen set to false");
  }, []);

  const chunkAudio = useCallback(async (audioBlob: Blob): Promise<Blob[]> => {
    console.log("Starting audio chunking...");
    const networkType = getNetworkType();
    const chunkDuration = getChunkDuration(networkType);
    console.log(
      `Network type: ${networkType}, Chunk duration: ${chunkDuration}s`,
    );

    const chunks: Blob[] = [];
    const chunkSize = chunkDuration * 1000; // Convert to milliseconds

    const audioBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioSource = await audioContext.decodeAudioData(audioBuffer);
    console.log(`Audio duration: ${audioSource.duration}s`);

    for (
      let start = 0;
      start < audioSource.duration * 1000;
      start += chunkSize
    ) {
      const end = Math.min(start + chunkSize, audioSource.duration * 1000);
      console.log(`Processing chunk: ${start / 1000}s to ${end / 1000}s`);

      const chunkBuffer = audioContext.createBuffer(
        audioSource.numberOfChannels,
        ((end - start) / 1000) * audioSource.sampleRate,
        audioSource.sampleRate,
      );

      for (let channel = 0; channel < audioSource.numberOfChannels; channel++) {
        const channelData = audioSource.getChannelData(channel);
        chunkBuffer.copyToChannel(
          channelData.subarray(
            Math.floor((start / 1000) * audioSource.sampleRate),
            Math.floor((end / 1000) * audioSource.sampleRate),
          ),
          channel,
        );
      }

      const chunkBlob = await new Promise<Blob>((resolve) => {
        const offlineContext = new OfflineAudioContext(
          chunkBuffer.numberOfChannels,
          chunkBuffer.length,
          chunkBuffer.sampleRate,
        );

        const bufferSource = offlineContext.createBufferSource();
        bufferSource.buffer = chunkBuffer;
        bufferSource.connect(offlineContext.destination);
        bufferSource.start();

        offlineContext.startRendering().then((renderedBuffer) => {
          const wavBlob = audioBufferToWav(renderedBuffer);
          console.log(`Chunk created: ${wavBlob.size} bytes`);
          resolve(wavBlob);
        });
      });

      chunks.push(chunkBlob);
    }

    console.log(`Chunking complete. Total chunks: ${chunks.length}`);
    return chunks;
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioBlob,
    chunkAudio,
    audioMimeType,
    audioUrl,
    setAudioUrl,
    isConfirmOpen,
    handleToggleRecording,
    handleConfirmStop,
    cancelStopRecording,
  };
};

// Helper function to convert AudioBuffer to WAV format
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const outBuffer = new ArrayBuffer(length);
  const view = new DataView(outBuffer);
  const channels: Float32Array[] = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit (hardcoded in this demo)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i));

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true); // write 16-bit sample
      pos += 2;
    }
    offset++; // next source sample
  }

  // create Blob
  return new Blob([outBuffer], { type: "audio/wav" });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

export default useAudioRecording;
