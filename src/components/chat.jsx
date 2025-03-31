import { useState } from "react";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./chat.scss";
import "./sidebar.scss";

function Chat() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const navigate = useNavigate();
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim() === "") return;
        const chatId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        
        setMessages([...messages, {
            text: inputValue,
            sender: "user"
        }]);
        setInputValue("");
        navigate(`/active-chat/${chatId}`);
    };

    const isChatActive = messages.length > 0;
    
    return (
        <div className={`chatpage-container`}>
            <div className="chat-sidebar">
            </div>
            <div className="chat-container">
                <div className="chatbox-container">
                    <div className="chat-header">
                        <h2>Welcome to Hello Kitty Chat!</h2>
                        <p>Start a conversation by typing a message below.</p>
                    </div>
                    <div className="chat-box">
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
            </div>
        </div>
    );
}

export default Chat;