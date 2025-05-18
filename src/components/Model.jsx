import React from "react";
import { useState } from "react";
import "../styles/model.scss";

const ModelButton = ({ selectedModel, setSelectedModel }) => {
    const models = ["DeepSeek R1", "QWEN", "LLaMa 4 scout"];
    const [isOpen, setIsOpen] = useState(false);

    const handleModelSelect = (modelName) => {
        if (selectedModel !== modelName) {
            setSelectedModel(modelName);
        }

        setIsOpen(false);
    };

    return (
        <div className="model-container">
            <button
                className="model-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="AI model"
                type="button">
                <span className="model-name">{selectedModel}</span>
            </button>

            {isOpen && (
                <div className="model-dropdown">
                    {models.map((modelName) => (
                        <div
                            key={modelName}
                            className={`model-option ${selectedModel === modelName ? "active" : ""
                                }`}
                            onClick={() => handleModelSelect(modelName)}>
                            <span>{modelName}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ModelButton;
