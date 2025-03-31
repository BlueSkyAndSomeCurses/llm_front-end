import { Menu, PlusCircle, MessageSquare, LogOut } from "lucide-react";
import "./sidebar.scss";

function Sidebar() {
    return (
        <div className="chat-sidebar">
            <div className="sidebar-top">
                <button className="sidebar-icon menu">
                    <Menu size={30} />
                </button>
                <button className="sidebar-icon">
                    <PlusCircle size={30} />
                </button>
                <button className="sidebar-icon">
                    <MessageSquare size={30} />
                </button>
            </div>
            <div className="sidebar-bottom">
                <button className="sidebar-icon">
                    <LogOut size={30} />
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
