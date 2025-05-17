import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/chat.scss";
import "../styles/sidebar.scss";
import Sidebar from "./Sidebar";
import ModelButton from "./Model";
import "../styles/popups.scss";
import { getLLMResponse } from "../utils/llm_rest";
import { saveMessage } from "./ChatAPI";

function Chat() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [user, setUser] = useState(null);
    const [selectedModel, setSelectedModel] = useState("DeepSeek R1");
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const loadUserData = () => {
            const userData = localStorage.getItem("user");
            if (userData && isMounted) {
                try {
                    setUser(JSON.parse(userData));
                } catch (error) {
                    console.error("Error parsing user data:", error);
                }
            }
        }; loadUserData();

        const handleUserDataChanged = (event) => {
            if (isMounted && event.detail && event.detail.user) {
                setUser(event.detail.user);
            }
        };

        window.addEventListener('userDataChanged', handleUserDataChanged);

        return () => {
            isMounted = false;
            window.removeEventListener('userDataChanged', handleUserDataChanged);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputValue.trim() === "") return;

        const currentInputValue = inputValue;
        const currentSelectedModel = selectedModel;

        const chatId =
            Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

        const initialMessage = {
            content: currentInputValue,
            role: "user",
        };

        try {
            if (user) {
                await saveMessage(currentInputValue, "question", chatId, currentSelectedModel);

                setMessages(prevMessages => [...prevMessages, initialMessage]);
            }
        } catch (error) {
            console.error("Error in chat:", error);
        }

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
