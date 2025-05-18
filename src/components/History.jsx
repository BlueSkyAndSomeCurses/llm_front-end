import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/chat.scss";
import "../styles/sidebar.scss";
import "../styles/history.scss";
import Sidebar from "./Sidebar.jsx";

const History = () => {
    const [chats, setChats] = useState([]);
    const [hoveredChatId, setHoveredChatId] = useState(null);
    const [hoverMessages, setHoverMessages] = useState({});
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const fetchChats = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await axios.get("/api/chats", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (isMounted) {
                    const chatData = response.data.chats;
                    setChats(chatData);
                }
            } catch (error) {
                console.error("Error fetching chats:", error);
                if (error.response?.status === 401 && isMounted) {
                    navigate("/login");
                }
            }
        };

        fetchChats();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    const handleChatClick = (chatId) => {
        navigate(`/chat/${chatId}`);
    };

    const handleChatHover = async (chatId) => {
        const currentChatId = chatId;
        setHoveredChatId(currentChatId);

        if (hoverMessages[currentChatId]) return;

        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`/api/messages/${currentChatId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const messages = response.data.messages;
            if (messages && messages.length > 0) {
                const lastUserMessage = messages.filter(m => m.messageType === "question").pop();
                const lastResponse = messages.filter(m => m.messageType === "response").pop();

                setHoverMessages(prev => {
                    if (prev[currentChatId]) return prev;

                    return {
                        ...prev,
                        [currentChatId]: {
                            userMessage: lastUserMessage?.messageText || "",
                            response: lastResponse?.messageText || ""
                        }
                    };
                });
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
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
