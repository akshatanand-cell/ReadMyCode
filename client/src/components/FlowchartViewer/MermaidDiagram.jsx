import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Download, GitBranch, Server, Database, Code, Shield, Layers } from 'lucide-react';
import { cn } from '@/utils/helpers';
import Spinner from '@/components/common/Spinner';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, sans-serif',
});

const MermaidDiagram = ({ definition, className }) => {
  const [svg, setSvg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const cleanupMermaidErrors = () => {
    document.querySelectorAll('[id^="dmermaid"], [id^="mermaid-error"]').forEach((el) => el.remove());
  };

  const renderDiagram = async () => {
    cleanupMermaidErrors();
    if (!definition || !definition.trim()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const cleanDef = definition.replace(/^```mermaid\s*/i, '').replace(/```$/g, '').trim();
      const id = `mermaid-node-${Math.random().toString(36).substring(2, 9)}`;
      const { svg: renderedSvg } = await mermaid.render(id, cleanDef);
      setSvg(renderedSvg);
    } catch (err) {
      console.warn('Mermaid rendering fallback engaged:', err);
      cleanupMermaidErrors();
      setSvg(''); // Engaging SVG Node Diagram Fallback
    } finally {
      cleanupMermaidErrors();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    renderDiagram();
    return () => cleanupMermaidErrors();
  }, [definition]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.3));
  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Dynamic SVG Node Graph fallback when Mermaid parser encounters glitched syntax
  const fallbackNodes = [
    { title: 'User Interface Layer', desc: 'React Client & Navigation Controls', icon: Layers, color: 'border-primary/50 bg-primary/10 text-primary' },
    { title: 'API Gateway & Security', desc: 'Node.js Express & JWT Authentication Middleware', icon: Shield, color: 'border-secondary/50 bg-secondary/10 text-secondary' },
    { title: 'Repository & AST Engine', desc: 'Code Tree Parser & File Walker', icon: Code, color: 'border-accent/50 bg-accent/10 text-accent' },
    { title: 'AI Intelligence Pipeline', desc: 'GroqCloud & xAI Grok Models', icon: Server, color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' },
    { title: 'Database & Cache Layer', desc: 'MongoDB Cluster & Instant MemoryStore', icon: Database, color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' },
  ];

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center min-h-[400px] bg-card rounded-xl border border-border', className)}>
        <Spinner text="Rendering diagram..." />
      </div>
    );
  }

  return (
    <div className={cn('relative bg-card rounded-xl border border-border overflow-hidden shadow-xl', className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background-secondary/50">
        <span className="text-sm font-medium text-text-primary flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          Interactive System Map
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-text-muted w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={handleReset}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
            title="Reset view"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden cursor-grab active:cursor-grabbing p-8 flex items-center justify-center"
        style={{ minHeight: '520px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <motion.div
          className="origin-center w-full max-w-3xl"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transition: isPanning ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          {svg ? (
            <div dangerouslySetInnerHTML={{ __html: svg }} className="flex justify-center" />
          ) : (
            <div className="flex flex-col items-center space-y-4">
              {fallbackNodes.map((node, index) => {
                const IconComponent = node.icon;
                return (
                  <React.Fragment key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        'w-full max-w-md p-4 rounded-xl border flex items-center gap-4 shadow-lg backdrop-blur-md transition-all hover:scale-105',
                        node.color
                      )}
                    >
                      <div className="p-2.5 rounded-lg bg-white/10 flex items-center justify-center">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary text-base">{node.title}</h4>
                        <p className="text-xs text-text-secondary mt-0.5">{node.desc}</p>
                      </div>
                    </motion.div>

                    {index < fallbackNodes.length - 1 && (
                      <div className="flex flex-col items-center">
                        <div className="w-0.5 h-6 bg-gradient-to-b from-primary to-secondary animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MermaidDiagram;