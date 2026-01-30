import React from 'react';
import './StatusIndicator.css';

const StatusIndicator = ({ currentStep, steps }) => {
  return (
    <div className="status-indicator">
      {steps.map((step, index) => (
        <div key={index} className="step-container">
          <div className={`step ${index + 1 === currentStep ? 'active' : index + 1 < currentStep ? 'completed' : ''}`}>
            {index + 1 < currentStep ? '✓' : index + 1}
          </div>
          <span className="step-label">{step}</span>
          {index < steps.length - 1 && (
            <div className={`connector ${index + 1 < currentStep ? 'completed' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default StatusIndicator;