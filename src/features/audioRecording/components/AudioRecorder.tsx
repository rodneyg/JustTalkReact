import React, { useState } from "react";
import useAudioRecording from "../hooks/useAudioRecording";

const AudioRecorder: React.FC = () => {
  const { isRecording, startRecording, stopRecording, audioBlob } =
    useAudioRecording();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleStartRecording = () => {
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  React.useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    }
  }, [audioBlob]);

  return (
    <div className="AudioRecorder">
      <button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      {audioUrl && (
        <audio controls src={audioUrl}>
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default AudioRecorder;
