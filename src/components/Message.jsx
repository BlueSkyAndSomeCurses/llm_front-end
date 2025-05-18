import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import '../styles/markdown.scss';
import '../styles/message.scss';

function Message({message}) {
    const {role, content} = message;

    return (
        <div className={`active-message ${role}-message`}>
            {role === "assistant" ? (
                <div className="markdown-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, [remarkMath, {
                            inlineMath: [['\\(', '\\)']],
                            displayMath: [['\\[', '\\]']]
                        }], remarkBreaks]}
                        rehypePlugins={[rehypeKatex, rehypeHighlight]}
                    >
                        {content.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$').replace(/\\\(/g, '$').replace(/\\\)/g, '$')}
                    </ReactMarkdown>
                </div>
            ) : (
                <div>{content}</div>
            )}
        </div>
    );
}

export default Message;
