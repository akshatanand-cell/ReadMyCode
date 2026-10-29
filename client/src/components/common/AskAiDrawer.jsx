import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  RefreshCw,
  HelpCircle,
  Code2,
  Layers,
  Terminal,
} from 'lucide-react';
import api from '@/services/api';
import MarkdownRenderer from '@/components/ReadmeViewer/MarkdownRenderer';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  { label: 'Project Architecture', prompt: 'Explain the high-level architecture and data flow of this repository.' },
  { label: 'Entry Point & Lifecycle', prompt: 'Where does execution begin and what is the primary lifecycle of the application?' },
  { label: 'Core Dependencies', prompt: 'What are the main libraries, frameworks, and external dependencies used here?' },
  { label: 'Security & Auth', prompt: 'How does this project handle authentication, security, and input validation?' },
];

export default function AskAiDrawer({ repoId, repoName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Hi! I'm your **Grok AI Codebase Assistant** for **${repoName || 'this repository'}**.\n\nAsk me anything about its architecture, functions, dependencies, or execution flow!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post(`/repos/${repoId}/chat`, {
        message: text,
      });

      const aiReply = res.data?.reply || 'I analyzed the repository, but could not formulate a complete answer. Please rephrase your question.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      toast.error('AI assistant request failed');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Sorry, I encountered an issue querying the repository context: ${err.response?.data?.message || err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-semibold rounded-full shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all border border-emerald-400/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        aria-label="Open Grok AI Codebase Assistant"
      >
        <Sparkles className="w-4 h-4 fill-black/20" />
        <span className="text-xs tracking-wide">Ask Grok AI</span>
      </motion.button>

      {/* Slide-over Drawer Backdrop & Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              aria-hidden="true"
            />

            {/* Slide-over Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 h-full w-full max-w-md sm:max-w-lg bg-card/95 backdrop-blur-xl border-l border-border z-50 flex flex-col shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Grok AI Codebase Assistant"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/80 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-text-primary">Grok AI Code Assistant</h3>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Live
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary truncate max-w-[220px]">
                      {repoName || 'Codebase Context'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-label="Close assistant panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Suggestions Bar */}
              <div className="p-3 border-b border-border/60 bg-background/50 overflow-x-auto scrollbar-thin shrink-0 flex items-center gap-2">
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold whitespace-nowrap pl-1">
                  Prompts:
                </span>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => handleSend(s.prompt)}
                    disabled={isLoading}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-card hover:bg-zinc-800 text-text-secondary hover:text-emerald-400 border border-border whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex gap-3',
                      m.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm',
                        m.role === 'user'
                          ? 'bg-emerald-500 text-black font-medium rounded-tr-none'
                          : 'bg-zinc-900/90 text-text-primary border border-border rounded-tl-none'
                      )}
                    >
                      {m.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      ) : (
                        <div className="prose prose-invert prose-xs max-w-none">
                          <MarkdownRenderer content={m.content} />
                        </div>
                      )}
                      <span
                        className={cn(
                          'block text-[9px] mt-1.5 opacity-60 text-right',
                          m.role === 'user' ? 'text-black/70' : 'text-text-muted'
                        )}
                      >
                        {m.timestamp}
                      </span>
                    </div>

                    {m.role === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-text-primary shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-zinc-900 border border-border rounded-2xl rounded-tl-none p-3 text-xs text-text-secondary flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>Grok AI is analyzing repository context...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="p-3.5 border-t border-border bg-card/90 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1.5 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about this codebase..."
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
                    aria-label="Ask Grok AI about this codebase"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-black rounded-lg transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                    aria-label="Send message to AI assistant"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
                <p className="text-[10px] text-text-muted text-center mt-2">
                  Powered by Grok AI & AST Parsing · Answers derived directly from repository files.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
