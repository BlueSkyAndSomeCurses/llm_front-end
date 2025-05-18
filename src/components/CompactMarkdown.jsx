import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import '../styles/compact-markdown.scss';

// Custom processor for line breaks
const processContent = (content) => {
  // Just process math delimiters without affecting line breaks
  return content
    .replace(/\\\[/g, '$$')
    .replace(/\\\]/g, '$$')
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$');
};

const CompactMarkdown = ({ content }) => {
  const processedContent = processContent(content);
  
  return (
    <div className="compact-markdown">
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm, 
          [remarkMath, {
            inlineMath: [['\\(', '\\)']],
            displayMath: [['\\[', '\\]']]
          }],
          remarkBreaks
        ]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          p: ({node, ...props}) => (
            <p 
              style={{
                margin: '0.1em 0',
                lineHeight: '1.1',
              }} 
              {...props} 
            />
          ),
          br: ({node, ...props}) => (
            <br 
              style={{
                display: 'block',
                content: '""',
                marginTop: '0.05em', // Super tiny margin
                height: '0.05em'
              }} 
              {...props} 
            />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default CompactMarkdown;
