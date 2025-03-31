import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send } from "lucide-react";

function ActiveChat() {
    const { chatId } = useParams();
    const navigate = useNavigate();
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
        <div className="chat-container">
            <div className="chat-header">
                <h2>Chat #{chatId}</h2>
                <button onClick={() => navigate("/chat")}>Back</button>
            </div>
            <div className="chat-box">
                <div className="messages-area">
                    {messages.map((msg, i) => (
                        <div key={i} className={`message ${msg.sender}-message`}>
                            {msg.text}
                        </div>
                    ))}
                </div>
                <form className="chat-input" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Type a message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button type="submit" className="send-button">
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ActiveChat;