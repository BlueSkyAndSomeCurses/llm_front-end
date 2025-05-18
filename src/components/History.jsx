import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/chat.scss";
import "../styles/sidebar.scss";
import "../styles/history.scss";
import Sidebar from "./Sidebar.jsx";
import { fetchChats, fetchMessages } from "../utils/ChatAPI.js";

const History = () => {
    const [chats, setChats] = useState([]);
    const [hoveredChatId, setHoveredChatId] = useState(null);
    const [hoverMessages, setHoverMessages] = useState({});
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const loadChats = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const chatData = await fetchChats(controller.signal);

                if (isMounted) {
                    setChats(chatData);
                }
            } catch (error) {
                if (!isMounted) return;
                
                if (error.name === "CanceledError" || error.name === "AbortError") {
                    console.log("Chat fetch aborted:", error.message);
                    return;
                }
                
                if (error.response?.status === 401) {
                    console.error("Authentication error:", error.message);
                    navigate("/login");
                    return;
                }
                
                console.error("Error fetching chats:", error);
            }
        };

        loadChats();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [navigate]);

    const handleChatClick = (chatId) => {
        navigate(`/chat/${chatId}`);
    };

    const handleChatHover = async (chatId) => {
        const currentChatId = chatId;
        setHoveredChatId(currentChatId);

        if (hoverMessages[currentChatId]) return;

        const controller = new AbortController();
        
        try {
            const serverMessages = await fetchMessages(currentChatId, controller.signal);

            if (serverMessages && serverMessages.length > 0) {
                const lastUserMessage = serverMessages.find(msg => msg.role === "user");
                const lastResponse = serverMessages.find(msg => msg.role === "assistant");

                setHoverMessages(prev => {
                    if (prev[currentChatId]) return prev;

                    return {
                        ...prev,
                        [currentChatId]: {
                            userMessage: lastUserMessage?.content || "",
                            response: lastResponse?.content || ""
                        }
                    };
                });
            }
        } catch (error) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                console.log("Message fetch aborted:", error.message);
                return;
            }
            
            console.error("Error fetching messages:", error);
        } finally {
            if (hoveredChatId !== currentChatId) {
                controller.abort();
            }
        }
    };

    const handleChatLeave = () => {
        setHoveredChatId(null);
    };

    const formatMessage = (text) => {
        const lines = text.split('\n');
        const displayLines = lines.slice(0, 10);
        const hasMoreLines = lines.length > 10;

        return (
            <>
                {displayLines.map((line, index) => (
                    <span key={index}>
                        {line}
                        {index < displayLines.length - 1 && <br />}
                    </span>
                ))}
                {hasMoreLines && <span className="more-lines">...</span>}
            </>
        );
    };

    const handleSidebarStateChange = (isExpanded) => {
        setSidebarExpanded(isExpanded);
    };

    return (
        <div className={`history-page ${sidebarExpanded ? "sidebar-expanded" : ""}`}>
            <Sidebar onToggle={handleSidebarStateChange} />
            <div className="history-container">
                <h1>Chat History</h1>
                <div className="chats-list">
                    {chats && chats.length > 0 ? (
                        chats.map((chat) => (
                            <div
                                key={chat._id}
                                className="chat-item"
                                onClick={() => handleChatClick(chat.chatId)}
                                onMouseEnter={() => handleChatHover(chat.chatId)}
                                onMouseLeave={handleChatLeave}>
                                <div className="chat-content">
                                    <div className="chat-main">
                                        <p className="chat-message">
                                            {chat.messageText}
                                        </p>
                                        <span className="chat-date">
                                            {new Date(
                                                chat.timestamp
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {hoveredChatId === chat.chatId && hoverMessages[chat.chatId] && (
                                        <div className="chat-preview">
                                            <div className="preview-message user">
                                                <strong>You:</strong> {formatMessage(hoverMessages[chat.chatId].userMessage)}
                                            </div>
                                            <div className="preview-message assistant">
                                                <strong>Kitty:</strong> {formatMessage(hoverMessages[chat.chatId].response)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-chats">No chats found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default History;
