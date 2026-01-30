// components/AudioRecorder/AudioRecorder.jsx
import React from 'react';
import './AudioRecorder.css';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

const AudioRecorder = ({ onAudioRecorded, hasGlobalPermission = false }) => {
  const {
    isRecording,
    audioBlob,
    permissionGranted: localPermission,
    recordingTime,
    requestPermission,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  if (!hasGlobalPermission && !localPermission) {
    return (
      <div className="microphone-prompt">
        <div className="prompt-icon">🎤</div>
        <p>Acesso ao microfone necessário para gravar.</p>
        <button 
          onClick={requestPermission}
          className="permission-button"
        >
          Permitir Microfone
        </button>
      </div>
    );
  }

  const handleStartRecording = () => {
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleSendForTranscription = () => {
    if (audioBlob && onAudioRecorded) {
      onAudioRecorded(audioBlob);
    }
  };

  return (
    <div className="audio-recorder">
      {!isRecording && !audioBlob && (
        <div className="ready-to-record">
          <div className="mic-status">
            <span className="mic-icon">🎤</span>
            <span>Microfone Pronto</span>
          </div>
          <button
            onClick={handleStartRecording}
            className="record-button start"
          >
            ⏺️ Iniciar Gravação
          </button>
        </div>
      )}

      {isRecording && (
        <div className="recording-active">
          <div className="recording-header">
            <div className="recording-indicator">
              <span className="pulse"></span>
              <span>GRAVANDO...</span>
            </div>
            <div className="recording-time">{recordingTime}</div>
          </div>
          
          <button
            onClick={handleStopRecording}
            className="record-button stop"
          >
            ⏹️ Parar Gravação
          </button>
        </div>
      )}

      {audioBlob && !isRecording && (
        <div className="recording-complete">
          <div className="audio-preview">
            <audio 
              src={URL.createObjectURL(audioBlob)} 
              controls 
              className="audio-player"
            />
          </div>
          
          <div className="action-buttons">
            <button
              onClick={handleStartRecording}
              className="action-button retry"
            >
              🔄 Gravar Novamente
            </button>
            
            <button
              onClick={handleSendForTranscription}
              className="action-button process"
            >
              📝 Enviar para Transcrição
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;