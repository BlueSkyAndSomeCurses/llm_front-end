import React, { useRef, useEffect } from 'react';
import { Send, XCircle } from 'lucide-react';
import '../styles/messageInput.scss';

function MessageInput({ 
  inputValue, 
  setInputValue, 
  handleSubmit, 
  isLoading, 
  handleCancel 
}) {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const scrollPos = window.scrollY;
      
      textarea.style.height = 'auto';
      
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
      
      window.scrollTo(0, scrollPos);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      resizeTextarea();
    }, 0);
    
    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <div className="form-wrapper">
      <form
        className="active-chat-input"
        onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className="active-input-field multiline"
          placeholder="Type a message... (Shift+Enter for new line)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <div className="active-input-utils">
          <button
            type={isLoading ? "button" : "submit"}
            onClick={isLoading ? handleCancel : undefined}
            className={`active-send-button ${isLoading ? "cancel-button" : ""}`}>
            {isLoading ? <XCircle size={20} /> : <Send size={20} />}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MessageInput;
