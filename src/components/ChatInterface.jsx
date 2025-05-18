import React, {useState} from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

function ChatInterface({messages, isLoading, onSubmit, onCancel}) {
    const [inputValue, setInputValue] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const currentInputValue = inputValue;
        setInputValue("");
        await onSubmit(currentInputValue);
    };

    return (
        <div className="active-chatbox-container">
            <div className="active-chat-box">
                <MessageList
                    messages={messages}
                    isLoading={isLoading}
                />
                <MessageInput
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    handleSubmit={handleSubmit}
                    isLoading={isLoading}
                    handleCancel={onCancel}
                />
            </div>
        </div>
    );
}

export default ChatInterface;
