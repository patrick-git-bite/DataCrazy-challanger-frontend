import React from 'react';
import './ChatResponse.css';

const ChatResponse = ({ response }) => {
  return (
    <div className="chat-response">
      <div className="chat-avatar">
        <span>🤖</span>
      </div>
      <div className="chat-content">
        <div className="chat-header">
          <strong>Assistente</strong>
        </div>
        <div className="chat-message">
          {response.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatResponse;