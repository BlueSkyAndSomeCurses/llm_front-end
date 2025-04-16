import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/chat.scss";
import "../styles/sidebar.scss";
import Sidebar from "./sidebar";
import ModelButton from "./model";
import "../styles/popups.scss";
import { getLLMResponse } from "../utils/llm_rest";

function Chat() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [user, setUser] = useState(null);
    const [selectedModel, setSelectedModel] = useState("DeepSeek R1");
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputValue.trim() === "") return;

        const chatId =
            Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

        const initialMessage = {
            content: inputValue,
            role: "user",
        };

        localStorage.setItem(
            `chat_${chatId}`,
            JSON.stringify([initialMessage])
        );

        try {
            if (user) {
                const token = localStorage.getItem("token");

                await axios.post(
                    "/api/messages",
                    {
                        messageText: inputValue,
                        chatId: chatId,
                        messageType: "question",
                        model: selectedModel,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setMessages([...messages, initialMessage]);
            }
        } catch (error) {
            console.error("Error in chat:", error);
        }

        localStorage.setItem("selectedModel", selectedModel);
        setInputValue("");
        navigate(`/chat/${chatId}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className={`chatpage-container`}>
            <Sidebar />
            <div className="chat-container">
                <div className="chatbox-container">
                    <div className="chat-header">
                        <h2>Welcome to Hello Kitty Chat!</h2>
                        <p>Start a conversation by typing a message below.</p>
                    </div>
                    <div className="chat-box">
                        <div className="messages-area">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`message ${msg.role}-message`}>
                                    {msg.content}
                                </div>
                            ))}
                        </div>
                        <form className="chat-input" onSubmit={handleSubmit}>
                            <textarea
                                className="input-field multiline"
                                placeholder="Type a message... (Shift+Enter for new line)"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={1}
                            />
                            <div className="input-utils">
                                <ModelButton
                                    selectedModel={selectedModel}
                                    setSelectedModel={setSelectedModel}
                                />
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
