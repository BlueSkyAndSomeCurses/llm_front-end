import React from 'react';
import { useState } from 'react';
import "./model.scss"

const ModelButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="model-container">
      <button
        className="model-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="AI model"
        type="button"
      >
        <span className="model-name">Model</span>
      </button>

      {isOpen && (
        <div className="model-dropdown">
          <div className="model-option active">
            <span>DeepSeek R1</span>
          </div>
          <div className="model-option">
            <span>QWEN</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelButton;