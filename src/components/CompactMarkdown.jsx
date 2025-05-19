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

function CompactMarkdown({ content }) {
    const processedContent = content ? content.replace(/\n{2,}/g, '\n').trim() : '';
    
    const components = {
        code({node, inline, className, children, ...props}) {
            if (inline) {
                return <code className="inline-code" {...props}>{children}</code>;
            }
            
            return <code className={className} {...props}>{children}</code>;
        },
        br: () => <span className="line-break"></span>,
        p: ({children}) => <p className="single-line-paragraph">{children}</p>,
        li: ({children, ...props}) => <li className="compact-list-item" {...props}>{children}</li>
    };

    return (
        <div className="markdown-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, [remarkMath, {
                    inlineMath: [['\\(', '\\)']],
                    displayMath: [['\\[', '\\]']]
                }], remarkBreaks]}
                rehypePlugins={[rehypeKatex, [rehypeHighlight, { 
                            detect: true,
                            ignoreMissing: true,
                            subset: false
                        }]]}
                components={components}
            >
                {processedContent || content}
            </ReactMarkdown>
        </div>
    );
}

export default CompactMarkdown;