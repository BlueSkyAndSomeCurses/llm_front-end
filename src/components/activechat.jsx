import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";
import "./activechat.scss";
import "./sidebar.scss";
import Sidebar from "./sidebar";

function ActiveChat() {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    
    useEffect(() => {
        const savedMessages = localStorage.getItem(`chat_${chatId}`);
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    }, [chatId]);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim() === "") return;
        
        const newMessages = [...messages, {
            text: inputValue,
            sender: "user"
        }];
        
        setMessages(newMessages);
        setInputValue("");
        localStorage.setItem(`chat_${chatId}`, JSON.stringify(newMessages));
    };
    
    return (
        <div className="active-chat-container">
            <Sidebar />
            <div className="active-chat-content">
                <div className="active-chatbox-container">
                    <div className="active-chat-box">
                        <div className="active-messages-area">
                            {messages.map((msg, i) => (
                                <div key={i} className={`active-message ${msg.sender}-message`}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>
                        <form className="active-chat-input" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                className="active-input-field"
                                placeholder="Type a message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <div className="active-input-utils">
                                <button type="submit" className="active-send-button">
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

export default ActiveChat;