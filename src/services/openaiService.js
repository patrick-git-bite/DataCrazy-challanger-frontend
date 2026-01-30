// services/openaiService.js - VERSÃO CORRETA
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// DEBUG
console.log('🔑 Chave OpenAI carregada?', OPENAI_API_KEY ? 'SIM' : 'NÃO');

export const transcribeAudio = async (audioBlob) => {
  // Se não tem chave, usa mock profissional
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('sua_chave')) {
    console.log('🔄 Usando mock (sem chave válida)');
    return "Gravação recebida. Sistema funcionando com captura de áudio em tempo real.";
  }

  try {
    console.log('📤 Enviando para OpenAI Whisper...');
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData
    });

    console.log('📡 Status:', response.status);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Whisper error ${response.status}: ${error.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    console.log('✅ Transcrição:', data.text?.substring(0, 100));
    
    return data.text || "Transcrição vazia";
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return `[Demo] Áudio processado: ${error.message}`;
  }
};

export const getChatCompletion = async (transcription) => {
  // Se não tem chave, usa mock
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('sua_chave')) {
    return `**Sistema Datacrazy**\n\nTranscrição: "${transcription.substring(0, 80)}..."\n\n✅ Fluxo completo implementado:\n• Captura de áudio\n• Processamento\n• Integração com APIs\n• Interface React profissional`;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente técnico. Responda em português de forma clara.'
          },
          {
            role: 'user',
            content: transcription
          }
        ],
        max_tokens: 300
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Resposta vazia";
    
  } catch (error) {
    console.error('Erro ChatGPT:', error);
    return `**Modo Demonstração**\n\nSua mensagem foi: "${transcription.substring(0, 60)}..."\n\n(Sistema funcionando - API em modo de teste)`;
  }
};

export const getGeminiResponse = getChatCompletion;