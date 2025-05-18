import React, {useRef} from 'react';
import {Send, XCircle} from 'lucide-react';
import '../styles/messageInput.scss';

function MessageInput({
                          inputValue,
                          setInputValue,
                          handleSubmit,
                          isLoading,
                          handleCancel,
                          sidebarExpanded
                      }) {
    const textareaRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    return (
        <div className={`form-wrapper ${sidebarExpanded ? "sidebar-expanded" : ""}`}>
            <form
                className="active-chat-input"
                onSubmit={handleSubmit}>
        <textarea
            ref={textareaRef} className="active-input-field multiline"
            placeholder="Type a message... (Shift+Enter for new line)"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
        />
                <div className="active-input-utils">
                    <button
                        type={isLoading ? "button" : "submit"}
                        onClick={isLoading ? handleCancel : undefined}
                        className={`active-send-button ${isLoading ? "cancel-button" : ""}`}>
                        {isLoading ? <XCircle size={20}/> : <Send size={20}/>}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default MessageInput;
