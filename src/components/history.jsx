import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/chat.scss";
import "../styles/sidebar.scss";
import "../styles/history.scss";
import Sidebar from "./sidebar";

const History = () => {
    const [chats, setChats] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
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
                const chatData = response.data.chats;
                setChats(chatData);
            } catch (error) {
                console.error("Error fetching chats:", error);
                if (error.response?.status === 401) {
                    navigate("/login");
                }
            }
        };

        fetchChats();
    }, [navigate]);

    const handleChatClick = (chatId) => {
        navigate(`/chat/${chatId}`);
    };


    return (
        <div className="history-page">
            <Sidebar />
            <div className="history-container">
                <h1>Chat History</h1>
                <div className="chats-list">
                    {chats && chats.length > 0 ? (
                        chats.map((chat) => (
                            <div
                                key={chat._id}
                                className="chat-item"
                                onClick={() => handleChatClick(chat.chatId)}>
                                <div className="chat-content">
                                    <p className="chat-message">
                                        {chat.messageText}
                                    </p>
                                    <span className="chat-date">
                                        {new Date(
                                            chat.timestamp
                                        ).toLocaleDateString()}
                                    </span>
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
