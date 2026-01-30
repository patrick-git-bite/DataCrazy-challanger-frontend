import React from 'react';
import './TranscriptionDisplay.css';

const TranscriptionDisplay = ({ text }) => {
  return (
    <div className="transcription-display">
      <div className="transcription-content">
        <p>{text}</p>
      </div>
      <div className="transcription-meta">
        <span>Caracteres: {text.length}</span>
      </div>
    </div>
  );
};

export default TranscriptionDisplay;