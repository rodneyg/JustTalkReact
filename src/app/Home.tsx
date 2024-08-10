import React from 'react';
import AudioRecorder from '../features/audioRecording/components/AudioRecorder';

const Home: React.FC = () => {
  return (
    <div className="Home">
      <h1>JustTalk</h1>
      <AudioRecorder />
    </div>
  );
};

export default Home;