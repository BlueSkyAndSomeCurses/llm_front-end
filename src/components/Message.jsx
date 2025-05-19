import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import '../styles/codeTheme.scss';
import '../styles/markdown.scss';
import '../styles/message.scss';

function Message({message}) {
    const {role, content} = message;

    const components = {
        code({node, inline, className, children, ...props}) {
            if (inline) {
                return <code className="inline-code" {...props}>{children}</code>;
            }

            return <code className={className} {...props}>{children}</code>;
        }
    };

    return (<div className={`active-message ${role}-message`}>
            {role === "assistant" ? (<div className="markdown-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, [remarkMath, {
                            inlineMath: [['\\(', '\\)']], displayMath: [['\\[', '\\]']]
                        }], remarkBreaks]}
                        rehypePlugins={[rehypeKatex, [rehypeHighlight, {
                            detect: true, ignoreMissing: true, subset: false
                        }]]}
                        components={components}
                    >
                        {content.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$').replace(/\\\(/g, '$').replace(/\\\)/g, '$')}
                    </ReactMarkdown>
                </div>) : (<div className="user-content">{content}</div>)}
        </div>);
}

export default Message;
