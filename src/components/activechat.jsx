import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";
import "./activechat.scss";
import "./sidebar.scss";
import Sidebar from "./sidebar";

function ActiveChat() {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    
    useEffect(() => {
        const savedMessages = localStorage.getItem(`chat_${chatId}`);
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    }, [chatId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateMockResponse = (userMessage) => {
        // Simple mock responses based on keywords
        const responses = [
            "I understand your question. Let me help you with that.",
            "That's an interesting point. Here's what I think...",
            "I can assist you with that. Here's my analysis:",
            "Let me break this down for you...",
            "Based on my knowledge, here's what I can tell you...",
            "I'll help you understand this better. Here's what you need to know:",
            "That's a great question! Here's my response:",
            "Let me explain this in detail...",
            "I can provide some insights on this topic...",
            "Here's what I've learned about this..."
        ];
        
        // Add some delay to simulate API call
        return new Promise(resolve => {
            setTimeout(() => {
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                resolve(randomResponse + " " + userMessage.split(" ").slice(0, 5).join(" ") + "...");
            }, 1000);
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputValue.trim() === "") return;
        
        const userMessage = {
            text: inputValue,
            sender: "user"
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);
        
        try {
            const mockResponse = await generateMockResponse(inputValue);
            const assistantMessage = {
                text: mockResponse,
                sender: "assistant"
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            localStorage.setItem(`chat_${chatId}`, JSON.stringify([...messages, userMessage, assistantMessage]));
        } catch (error) {
            console.error("Error generating response:", error);
        } finally {
            setIsLoading(false);
        }
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
                            {isLoading && (
                                <div className="active-message assistant-message">
                                    Thinking...
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <form className="active-chat-input" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                className="active-input-field"
                                placeholder="Type a message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isLoading}
                            />
                            <div className="active-input-utils">
                                <button type="submit" className="active-send-button" disabled={isLoading}>
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