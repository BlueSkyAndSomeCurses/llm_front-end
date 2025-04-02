import {Menu, PlusCircle, MessageSquare, LogOut} from "lucide-react";
import {useNavigate} from "react-router-dom";
import LogoutButton from "./LogoutButton";
import "../styles/sidebar.scss";
import {useState, useEffect} from "react";
import axios from "axios";

function Sidebar() {
    const [chats, setChats] = useState([]);
    const [expanded, setExpanded] = useState(false);
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
                <button className="sidebar-icon menu" onClick={toggleSidebar}>
                    <Menu size={30} />
                    {expanded && <span className="icon-text">Menu</span>}
                </button>
                <button className="sidebar-icon" onClick={handleNewChat}>
                    <PlusCircle size={30} />
                    {expanded && <span className="icon-text">New Chat</span>}
                </button>
                <button className="sidebar-icon" onClick={() => navigate("/history")}>
                    <MessageSquare size={30} />
                    {expanded && <span className="icon-text">History</span>}
                </button>
                {expanded && (
                    <div className="history">
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
                <div className="sidebar-icon">
                    <LogoutButton size={30} />
                    {expanded && <span className="icon-text">Logout</span>}
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
