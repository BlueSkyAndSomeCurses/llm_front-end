import React from 'react';
import { useState } from 'react';
import "../styles/model.scss"

const ModelButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("DeepSeek R1");

  const handleModelSelect = (modelName) => {
    setSelectedModel(modelName);
    setIsOpen(false);
  };

  return (
    <div className="model-container">
      <button
        className="model-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="AI model"
        type="button"
      >
        <span className="model-name">{selectedModel}</span>
      </button>

      {isOpen && (
        <div className="model-dropdown">
          <div
            className={`model-option ${selectedModel === "DeepSeek R1" ? "active" : ""}`}
            onClick={() => handleModelSelect("DeepSeek R1")}
          >
            <span>DeepSeek R1</span>
          </div>
          <div
            className={`model-option ${selectedModel === "QWEN" ? "active" : ""}`}
            onClick={() => handleModelSelect("QWEN")}
          >
            <span>QWEN</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelButton;