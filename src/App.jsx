import React, { useState, useEffect } from 'react';
import AudioRecorder from './components/AudioRecorder/AudioRecorder';
import TranscriptionDisplay from './components/TranscriptionDisplay/TranscriptionDisplay';
import ChatResponse from './components/ChatResponse/ChatResponse';
import StatusIndicator from './components/StatusIndicator/StatusIndicator';
import { transcribeAudio, getChatCompletion } from './services/openaiService';
import './App.css';

function App() {
  const [transcription, setTranscription] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [micPermission, setMicPermission] = useState(null); // null = não perguntou ainda, true/false = resposta

  // 🔒 Solicita permissão AUTOMATICAMENTE ao carregar
  useEffect(() => {
    const requestMicrophonePermission = async () => {
      try {
        // Tenta acessar o microfone (o navegador mostrará o popup)
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        // Para imediatamente (só queríamos a permissão)
        stream.getTracks().forEach(track => track.stop());
        
        setMicPermission(true);
        console.log('✅ Microphone permission granted automatically');
      } catch (error) {
        console.log('❌ Microphone permission denied:', error.message);
        setMicPermission(false);
      }
    };

    // Espera um pouco para não assustar o usuário
    const timer = setTimeout(() => {
      requestMicrophonePermission();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleAudioRecorded = async (audioBlob) => {
    if (!audioBlob || audioBlob.size === 0) {
      alert('⚠️ Audio empty or too short. Please record again.');
      return;
    }
    
    setLoading(true);
    setCurrentStep(2);
    
    try {
      const transcribedText = await transcribeAudio(audioBlob);
      setTranscription(transcribedText);
      
      setCurrentStep(3);
      const response = await getChatCompletion(transcribedText);
      setChatResponse(response);
    } catch (error) {
      console.error('Process error:', error);
      alert('Error processing audio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTranscription('');
    setChatResponse('');
    setCurrentStep(1);
  };

  // Tela de permissão negada
  if (micPermission === false) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🎙️ Datacrazy Assistente de Voz</h1>
          <p className="gradient-text">É necessário ter acesso a um microfone para esta experiência..</p>
        </header>

        <main className="app-main">
          <div className="permission-denied-card">
            <div className="permission-icon">🔒</div>
            <h2>É necessária autorização para usar o microfone.</h2>
            <p className="denied-text">
              Para usar o assistente de voz, permita o acesso ao microfone no seu navegador..
            </p>
            
            <div className="permission-steps">
              <h3>Como habilitar:</h3>
              <ol>
                <li>Procure o ícone do microfone na barra de endereço do seu navegador.</li>
                <li>Clique nele e selecione "Permitir".</li>
                <li>Atualize esta página para continuar.</li>
              </ol>
            </div>

            <div className="browser-icons">
              <div className="browser-hint">
                <span>Chrome: </span>
                <div className="icon-preview">🎤 → Clique  → Permitir</div>
              </div>
              <div className="browser-hint">
                <span>Firefox: </span>
                <div className="icon-preview">🗣️ → Clique  → Permitir</div>
              </div>
              <div className="browser-hint">
                <span>Edge: </span>
                <div className="icon-preview">🔊 → Clique  → Permitir</div>
              </div>
            </div>

            <button 
              onClick={() => window.location.reload()} 
              className="refresh-button"
            >
              🔄 Atualize a página após permitir.
            </button>
          </div>
        </main>

        <footer className="app-footer">
          <p>Plataforma de Inteligência de Voz Datacrazy</p>
        </footer>
      </div>
    );
  }

  // Tela de carregamento enquanto solicita permissão
  if (micPermission === null) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🎙️ Datacrazy Assistente de Voz</h1>
          <p>Preparando seu microfone...</p>
        </header>

        <main className="app-main">
          <div className="permission-loading">
            <div className="loading-spinner-large"></div>
            <h2>Solicitando acesso ao microfone</h2>
            <p>Por favor, permita o acesso ao microfone na janela pop-up do navegador para continuar..</p>
            <div className="permission-tip">
              💡 <strong>Tip:</strong> Se você não vir uma janela pop-up, verifique se há um ícone de microfone na barra de endereço do seu navegador..
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Interface principal (quando permissão = true)
  return (
    <div className="app">
      <header className="app-header">
        <h1>🎙️ Datacrazy Assistente de Voz</h1>
        <p className="gradient-text">Capture entradas de voz, obtenha transcrições com inteligência artificial e respostas inteligentes em tempo real.</p>
        <div className="tech-stack">
          <span className="tech-badge">React</span>
          <span className="tech-badge">OpenAI API</span>
          <span className="tech-badge">Web Audio</span>
          <span className="tech-badge">Real-time</span>
        </div>
      </header>

      <main className="app-main">
        <div className="process-flow">
          <StatusIndicator 
            currentStep={currentStep}
            steps={['Gravação', 'Transcrição', 'Resposta de IA']}
          />
        </div>

        <div className="content-container">
          {currentStep === 1 && (
            <section className="Gravação-section">
              <h2>🎤 Gravação de Voz</h2>
              <AudioRecorder onAudioRecorded={handleAudioRecorded} />
            </section>
          )}

          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Processando áudio com IA... Isso pode levar um momento..</p>
            </div>
          )}

          {transcription && (
            <section className="transcription-section">
              <h2>📝 Transcrição por IA</h2>
              <TranscriptionDisplay text={transcription} />
            </section>
          )}

          {chatResponse && (
            <section className="response-section">
              <h2>🤖 Resposta do assistente de IA</h2>
              <ChatResponse response={chatResponse} />
            </section>
          )}

          {(transcription || chatResponse) && (
            <div className="reset-container">
              <button onClick={handleReset} className="reset-button">
                🔄 Nova Sessão de Processamento
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Plataforma de Inteligência de Voz Datacrazy • Real-time Speech-to-Text • AI-Powered Responses</p>
        <p className="footer-sub">Built with React • OpenAI Whisper & GPT-3.5 • Professional UI/UX</p>
      </footer>
    </div>
  );
}

export default App;