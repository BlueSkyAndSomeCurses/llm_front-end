import {Menu, PlusCircle, MessageSquare} from "lucide-react";
import LogoutButton from "./LogoutButton";
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
                <LogoutButton />
            </div>
        </div>
    );
}

export default Sidebar;
