import {Menu, PlusCircle, MessageSquare, ChevronRight, ChevronLeft} from "lucide-react";
import {useNavigate} from "react-router-dom";
import UserButton from "./UserButton.jsx";
import "../styles/sidebar.scss";
import "../styles/popups.scss";
import {useState, useEffect} from "react";
import {fetchChats} from "../utils/ChatAPI";

function Sidebar({
                     onToggle = () => {
                     }
                 }) {
    const [chats, setChats] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [menuHovered, setMenuHovered] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const loadChats = async () => {
            try {
                const chatsData = await fetchChats(controller.signal);
                if (isMounted) {
                    setChats(chatsData);
                }
            } catch (error) {
                if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
                    console.error("Error fetching chats:", error);
                }
            }
        };

        loadChats();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);

    const toggleSidebar = () => {
        const newExpandedState = !expanded;
        setExpanded(newExpandedState);
        if (onToggle) {
            onToggle(newExpandedState);
        }
    };

    const handleNewChat = () => {
        navigate("/chat");
    };

    const handleChatClick = (chatId) => {
        navigate(`/chat/${chatId}`);
    };

    return (<div className={`chat-sidebar ${expanded ? "expanded" : "collapsed"}`}>
            <div className="sidebar-top">
                <div className="menu-container">
                    <button
                        className="sidebar-icon toggle-btn"
                        onClick={toggleSidebar}
                        onMouseEnter={() => setMenuHovered(true)}
                        onMouseLeave={() => setMenuHovered(false)}
                    >
                        <Menu className={`menu-icon ${menuHovered ? 'hide' : 'show'}`} size={25}/>
                        {menuHovered && (<>
                                <ChevronLeft className={`chevron-icon chevron-left ${expanded ? 'show' : 'hide'}`}
                                             size={25}/>
                                <ChevronRight className={`chevron-icon chevron-right ${expanded ? 'hide' : 'show'}`}
                                              size={25}/>
                            </>)}
                    </button>
                    {expanded && (<button
                            className="title-btn"
                            onClick={() => navigate("/")}
                        >
                            <span className="icon-text kitty-chat-text">Kitty Chat</span>
                        </button>)}
                </div>
                <button className="sidebar-icon" onClick={handleNewChat}>
                    <PlusCircle size={25}/>
                    {expanded && <span className="icon-text">New Chat</span>}
                </button>
                <button className="sidebar-icon" onClick={() => navigate("/history")}>
                    <MessageSquare size={25}/>
                    {expanded && <span className="icon-text">History</span>}
                </button>
                {expanded && (<div className="history">
                        <span className="history-title">Recents</span>
                        {chats.map((chat) => (<div
                                key={chat.chatId}
                                className="history-item"
                                onClick={() => handleChatClick(chat.chatId)}>
                                {chat.messageText.substring(0, 30)}
                            </div>))}
                    </div>)}
            </div>
            <div className="sidebar-bottom">
                <UserButton size={30} expanded={expanded}/>
            </div>
        </div>);
}

export default Sidebar;
