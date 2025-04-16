import { Menu, PlusCircle, MessageSquare, ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserButton from "./userbutton";
import "../styles/sidebar.scss";
import "../styles/popups.scss";
import { useState, useEffect } from "react";
import axios from "axios";

function Sidebar() {
    const [chats, setChats] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [menuHovered, setMenuHovered] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const response = await axios.get("/api/chats", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setChats(response.data.chats);
                }
            } catch (error) {
                console.error("Error fetching chats:", error);
            }
        };

        fetchChats();
    }, []);

    const toggleSidebar = () => {
        setExpanded(!expanded);
    };

    const handleNewChat = () => {
        navigate("/chat");
    };

    const handleChatClick = (chatId) => {
        navigate(`/chat/${chatId}`);
    };

    return (
        <div className={`chat-sidebar ${expanded ? "expanded" : "collapsed"}`}>
            <div className="sidebar-top">
                <div className="menu-container">
                    <button
                        className="sidebar-icon toggle-btn"
                        onClick={toggleSidebar}
                        onMouseEnter={() => setMenuHovered(true)}
                        onMouseLeave={() => setMenuHovered(false)}
                    >
                        <Menu className={`menu-icon ${menuHovered ? 'hide' : 'show'}`} size={25} />
                        {menuHovered && (
                            <>
                                <ChevronLeft className={`chevron-icon chevron-left ${expanded ? 'show' : 'hide'}`} size={25} />
                                <ChevronRight className={`chevron-icon chevron-right ${expanded ? 'hide' : 'show'}`} size={25} />
                            </>
                        )}
                    </button>
                    {expanded && (
                        <button
                            className="title-btn"
                            onClick={handleNewChat}
                        >
                            <span className="icon-text kitty-chat-text">Kitty Chat</span>
                        </button>
                    )}
                </div>
                <button className="sidebar-icon" onClick={handleNewChat}>
                    <PlusCircle size={25} />
                    {expanded && <span className="icon-text">New Chat</span>}
                </button>
                <button className="sidebar-icon" onClick={() => navigate("/history")}>
                    <MessageSquare size={25} />
                    {expanded && <span className="icon-text">History</span>}
                </button>
                {expanded && (
                    <div className="history">
                        <span className="history-title">Recents...</span>
                        {chats.map((chat) => (
                            <div
                                key={chat.chatId}
                                className="history-item"
                                onClick={() => handleChatClick(chat.chatId)}>
                                {chat.messageText.substring(0, 30)}...
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="sidebar-bottom">
                <UserButton size={30} expanded={expanded} />
            </div>
        </div>
    );
}

export default Sidebar;
