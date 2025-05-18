import React from 'react';
import CompactMarkdown from './CompactMarkdown';
import '../styles/markdown.scss';
import '../styles/message.scss';
import '../styles/markdown-fix.scss';

function Message({message}) {
    const {role, content} = message;

    return (
        <div className={`active-message ${role}-message`}>
            {role === "assistant" ? (
                <div className="markdown-content">
                    <CompactMarkdown content={content} />
                </div>
            ) : (
                <div className="user-content">{content}</div>
            )}
        </div>
    );
}

export default Message;
