import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/utils/helpers';
import { Copy, Check } from 'lucide-react';

const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-border shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-background-secondary border-b border-border">
        <span className="text-xs text-text-muted font-mono">{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '0.875rem',
          lineHeight: '1.7',
          backgroundColor: '#0d1117',
        }}
        showLineNumbers
        lineNumberStyle={{ color: '#6e7681', minWidth: '2.5em' }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

const MarkdownRenderer = ({ content, className }) => {
  return (
    <div className={cn('prose max-w-none text-text-primary', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-extrabold text-text-primary mt-8 mb-4 pb-2 border-b border-border tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold text-text-primary mt-6 mb-3 pb-1 border-b border-border tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold text-text-primary mt-5 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold text-text-primary mt-4 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-text-secondary leading-relaxed mb-4 text-base font-sans">
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-semibold underline-offset-4 transition-colors"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-text-secondary space-y-1.5 mb-4 ml-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-text-secondary space-y-1.5 mb-4 ml-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-text-secondary">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-primary/10 rounded-r-xl">
              <p className="text-text-secondary italic m-0">{children}</p>
            </blockquote>
          ),
          code: ({ inline, className: codeClassName, children }) => {
            const match = /language-(\w+)/.exec(codeClassName || '');
            const language = match ? match[1] : '';
            const value = String(children).replace(/\n$/, '');

            if (!inline && value.includes('\n')) {
              return <CodeBlock language={language} value={value} />;
            }

            return (
              <code className="px-1.5 py-0.5 bg-background-secondary border border-border rounded-md text-xs font-mono text-primary font-semibold">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <div className="my-4">{children}</div>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-border shadow-sm">
              <table className="w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-background-secondary border-b border-border">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary border-b border-border">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-text-secondary border-b border-border">
              {children}
            </td>
          ),
          hr: () => <hr className="my-6 border-border" />,
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-xl max-w-full h-auto my-4 border border-border shadow-md"
              loading="lazy"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;