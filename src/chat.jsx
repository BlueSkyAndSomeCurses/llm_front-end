import { useState } from "react";
import { Send } from "lucide-react";
import "./App.css";

function Chat() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim() === "") return;
        
        setMessages([...messages, {
            text: inputValue,
            sender: "user"
        }]);
        setInputValue("");
    };

    const isChatActive = messages.length > 0;
    
    return (
        <div className={`chat-container ${!isChatActive ? 'centered-chat' : ''}`}>
            <div className="chat-sidebar">
            </div>
            <div className="chat-header">
            </div>
            <div className="chat-box">
                {isChatActive && (
                    <div className="messages-area">
                        {messages.map((msg, i) => (
                            <div key={i} className={`message ${msg.sender}-message`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                )}
                <form className="chat-input" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Type a message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <div className="input-utils">
                        <button className="model-button">
                        </button>
                        <button type="submit" className="send-button">
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Chat;