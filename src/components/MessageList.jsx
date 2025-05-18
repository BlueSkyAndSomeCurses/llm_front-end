import React, {useRef, useEffect} from 'react';
import Message from './Message';
import HelloKittyAssistant from './HelloKittyAssistant';
import '../styles/messageList.scss';

function MessageList({messages, isLoading}) {
    const messagesEndRef = useRef(null);

    const hasAssistantMessage = messages && Array.isArray(messages) && messages.some(msg => msg.role === 'assistant');

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 50);

        return () => clearTimeout(timer);
    }, [messages]);

    return (
        <div className="active-messages-area">
            {messages.map((msg, i) => (
                <Message key={i} message={msg}/>
            ))}

            {(hasAssistantMessage || isLoading) && (
                <HelloKittyAssistant isThinking={isLoading}/>
            )}

            <div ref={messagesEndRef}/>
        </div>
    );
}

export default MessageList;
