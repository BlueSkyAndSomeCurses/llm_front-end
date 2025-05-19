import {useParams} from "react-router-dom";
import "../styles/activechat.scss";
import "../styles/sidebar.scss";
import Sidebar from "./Sidebar.jsx";
import ChatInterface from "./ChatInterface";
import useChatMessages from "../hooks/useChatMessages";
import useUserData from "../hooks/useUserData";
import useSidebarState from "../hooks/useSidebarState";

function ActiveChat() {
    const {chatId} = useParams();
    const user = useUserData();
    const {sidebarExpanded, handleSidebarStateChange} = useSidebarState();
    const {messages, isLoading, submitMessage, handleCancel} = useChatMessages(chatId);

    return (<div className={`active-chat-container ${sidebarExpanded ? "sidebar-expanded" : ""}`}>
            <Sidebar onToggle={handleSidebarStateChange}/>
            <div className="active-chat-content">
                <ChatInterface
                    messages={messages}
                    isLoading={isLoading}
                    onSubmit={submitMessage}
                    onCancel={handleCancel}
                    sidebarExpanded={sidebarExpanded}
                />
            </div>
        </div>);
}

export default ActiveChat;
