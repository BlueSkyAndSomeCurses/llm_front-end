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
    // Custom components for markdown rendering with pink theme
    const components = {
        code({node, inline, className, children, ...props}) {
            // For inline code (single backtick) - use simple inline display
            if (inline) {
                return <code className="inline-code" {...props}>{children}</code>;
            }
            
            // Code blocks (triple backtick) are already wrapped in pre by react-markdown
            return <code className={className} {...props}>{children}</code>;
        }
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
                {content}
            </ReactMarkdown>
        </div>
    );
}

export default CompactMarkdown;