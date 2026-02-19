import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
    return (
        <div className={`prose prose-slate max-w-none 
            prose-headings:text-slate-900 prose-headings:font-bold
            prose-p:text-slate-600 prose-p:leading-relaxed
            prose-strong:text-indigo-600 prose-strong:font-bold
            prose-li:text-slate-600
            prose-hr:border-slate-100
            prose-table:border-collapse prose-table:w-full prose-table:my-8
            prose-th:bg-slate-50 prose-th:p-4 prose-th:text-slate-900 prose-th:font-bold prose-th:text-left prose-th:border prose-th:border-slate-200
            prose-td:p-4 prose-td:text-slate-600 prose-td:border prose-td:border-slate-100
            ${className}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
