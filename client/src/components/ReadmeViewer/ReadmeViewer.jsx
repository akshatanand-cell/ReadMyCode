import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Button from '../common/Button';
import api from '@/services/api';

export default function ReadmeViewer({ repoId, content, onEdit }) {
  const [readme, setReadme] = useState(content || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [copied, setCopied] = useState(false);

  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (content) {
      setReadme(content);
    } else if (repoId) {
      // Fetch from API if content not provided directly
      fetchReadme();
    }
  }, [repoId, content]);

  const fetchReadme = async () => {
    try {
      setFetchError('');
      const res = await api.get(`/readme/${repoId}`);
      setReadme(res.data.readme);
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.message;
      console.error('Failed to fetch README:', serverMessage);
      setFetchError(serverMessage);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(readme);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([readme], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveEdit = () => {
    setReadme(editContent);
    setIsEditing(false);
    if (onEdit) onEdit(editContent);
  };

  const startEditing = () => {
    setEditContent(readme);
    setIsEditing(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium text-gray-700">README.md</span>
          {content && (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
              AI Generated
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={startEditing}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {fetchError && (
        <div className="mx-4 mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Couldn't load the README: {fetchError}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-full p-6 font-mono text-sm bg-gray-50 resize-none focus:outline-none"
            spellCheck={false}
          />
        ) : (
          <div className="p-8 max-w-4xl mx-auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-semibold text-gray-900 mt-5 mb-2">{children}</h3>,
                p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="ml-2">{children}</li>,
                a: ({ href, children }) => <a href={href} className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                code: ({ inline, className, children }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : 'text';
                  
                  if (inline) {
                    return (
                      <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-sm font-mono">
                        {children}
                      </code>
                    );
                  }
                  
                  return (
                    <div className="my-4 rounded-lg overflow-hidden">
                      <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 flex items-center justify-between">
                        <span>{language}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(String(children))}
                          className="hover:text-white transition"
                        >
                          Copy
                        </button>
                      </div>
                      <SyntaxHighlighter
                        language={language}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, borderRadius: 0, fontSize: '14px' }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-indigo-300 pl-4 py-1 my-4 bg-indigo-50/50 text-gray-600 italic">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-gray-200 rounded-lg">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                th: ({ children }) => <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">{children}</th>,
                td: ({ children }) => <td className="px-4 py-2 text-sm text-gray-600 border-b">{children}</td>,
                hr: () => <hr className="my-6 border-gray-200" />,
              }}
            >
              {readme || '# No README generated yet\n\nClick **Analyze** to generate documentation for this repository.'}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}