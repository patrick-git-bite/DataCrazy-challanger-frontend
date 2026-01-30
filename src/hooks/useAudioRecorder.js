// hooks/useAudioRecorder.js - VERSÃO COM QUALIDADE DE ÁUDIO
import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0); // Novo: nível de volume
  const [audioStream, setAudioStream] = useState(null); // Novo: referência ao stream
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);

  // Monitora volume enquanto grava
  const monitorVolume = useCallback((stream) => {
    if (!stream || !audioContextRef.current) return;
    
    try {
      if (!analyserRef.current) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;
        
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
      }
      
      const analyser = analyserRef.current;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVolume = () => {
        if (!isRecording || !analyserRef.current) return;
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        // Normaliza o volume (0-100)
        const normalizedVolume = Math.min(100, Math.max(0, (average / 128) * 100));
        setVolumeLevel(Math.round(normalizedVolume));
        
        if (isRecording) {
          requestAnimationFrame(updateVolume);
        }
      };
      
      updateVolume();
    } catch (error) {
      console.log('Monitor de volume não disponível:', error.message);
    }
  }, [isRecording]);

  const requestPermission = useCallback(async () => {
    try {
      // CONFIGURAÇÃO DE ÁUDIO OTIMIZADA PARA TRANSCRIÇÃO
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,           // Mono - melhor para transcrição
          sampleRate: 16000,         // Taxa ideal para Whisper
          echoCancellation: true,    // Remove eco
          noiseSuppression: true,    // Remove ruído de fundo
          autoGainControl: true,     // Ajusta volume automaticamente
          latency: 0.01              // Baixa latência
        },
        video: false
      });
      
      setAudioStream(stream);
      setPermissionGranted(true);
      
      // Cria MediaRecorder com configuração otimizada
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000 // 128 kbps - bom equilíbrio qualidade/tamanho
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm' 
        });
        setAudioBlob(audioBlob);
        audioChunksRef.current = [];
        
        // Para monitor de volume
        if (analyserRef.current) {
          analyserRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      };
      
      // Configurações de áudio para o MediaRecorder
      const audioTracks = stream.getAudioTracks();
      if (audioTracks[0]) {
        const constraints = audioTracks[0].getConstraints();
        console.log('🎚️ Configurações de áudio:', constraints);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      setPermissionGranted(false);
      return false;
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!mediaRecorderRef.current || isRecording) return;
    
    audioChunksRef.current = [];
    mediaRecorderRef.current.start(100); // Coleta dados a cada 100ms
    
    // Inicia monitor de volume
    if (audioStream) {
      monitorVolume(audioStream);
    }
    
    setIsRecording(true);
    setVolumeLevel(10); // Valor inicial
    
    // Inicia timer
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    console.log('🎤 Gravação iniciada com configurações otimizadas');
  }, [isRecording, audioStream, monitorVolume]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;
    
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setVolumeLevel(0);
    
    // Para timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Para monitor de volume
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    
    console.log('⏹️ Gravação parada');
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setRecordingTime(0);
    setVolumeLevel(0);
  }, []);

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioStream]);

  return {
    isRecording,
    audioBlob,
    permissionGranted,
    recordingTime: formatTime(recordingTime),
    volumeLevel, // Novo: nível de volume (0-100)
    requestPermission,
    startRecording,
    stopRecording,
    resetRecording,
  };
};