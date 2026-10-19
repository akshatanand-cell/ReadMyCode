import { useState, useEffect } from 'react';
import Button from '../common/Button';
import MarkdownRenderer from './MarkdownRenderer';
import api from '@/services/api';
import Spinner from '../common/Spinner';
import { FileText, Copy, Check, Download, Edit3, Save, X } from 'lucide-react';

export default function ReadmeViewer({ repoId, content, onEdit }) {
  const [readme, setReadme] = useState(content || '');
  const [loading, setLoading] = useState(!content && Boolean(repoId));
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (content) {
      setReadme(content);
      setLoading(false);
    } else if (repoId) {
      fetchReadme();
    }
  }, [repoId, content]);

  const fetchReadme = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await api.get(`/readme/${repoId}`);
      setReadme(res.data.readme || res.data.result?.content || '');
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.message;
      console.error('Failed to fetch README:', serverMessage);
      setFetchError(serverMessage);
    } finally {
      setLoading(false);
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
    <div className="flex flex-col bg-card rounded-2xl border border-border shadow-xl overflow-hidden transition-colors">
      {/* GitHub-style Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background-secondary/70">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-text-primary">README.md</span>
          {content && (
            <span className="px-2 py-0.5 bg-success/10 text-success border border-success/20 text-xs rounded-full font-medium">
              AI Generated
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleCopy} leftIcon={copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload} leftIcon={<Download className="w-3.5 h-3.5" />}>
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={startEditing} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)} leftIcon={<X className="w-3.5 h-3.5" />}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit} leftIcon={<Save className="w-3.5 h-3.5" />}>
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {fetchError && (
        <div className="mx-4 mt-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
          Couldn't load the README: {fetchError}
        </div>
      )}

      {/* Content */}
      <div className="p-6 sm:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner text="Generating README documentation..." />
          </div>
        ) : isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[500px] p-6 font-mono text-sm bg-background-secondary border border-border text-text-primary rounded-xl resize-none focus:outline-none focus:border-primary transition-all"
            spellCheck={false}
          />
        ) : (
          <MarkdownRenderer
            content={readme || '# No README generated yet\n\nClick **Analyze** on the dashboard to generate full documentation for this repository.'}
          />
        )}
      </div>
    </div>
  );
}