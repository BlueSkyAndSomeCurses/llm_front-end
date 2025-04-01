import { Menu, PlusCircle, MessageSquare } from "lucide-react";
import LogoutButton from "./LogoutButton";
import "./sidebar.scss";
import { useState } from "react";

function Sidebar() {
    const [expanded, setExpanded] = useState(false);

    const toggleSidebar = () => {
        setExpanded(!expanded);
    };

    return (
        <div className={`chat-sidebar ${expanded ? 'expanded' : 'collapsed'}`}>
            <div className="sidebar-top">
                <button className="sidebar-icon menu" onClick={toggleSidebar}>
                    <Menu size={30} />
                    {expanded && <span className="icon-text">Menu</span>}
                </button>
                <button className="sidebar-icon">
                    <PlusCircle size={30} />
                    {expanded && <span className="icon-text">New Chat</span>}
                </button>
                <button className="sidebar-icon">
                    <MessageSquare size={30} />
                    {expanded && <span className="icon-text">Messages</span>}
                </button>
                {expanded && (
                    <div className="history">
                        <h3>Chat History</h3>
                        <div className="history-item">Recent chat 1</div>
                        <div className="history-item">Recent chat 2</div>
                    </div>
                )}
            </div>
            <div className="sidebar-bottom">
                <LogoutButton />
                {expanded && <span className="icon-text">Logout</span>}
            </div>
        </div>
    );
}

export default Sidebar;