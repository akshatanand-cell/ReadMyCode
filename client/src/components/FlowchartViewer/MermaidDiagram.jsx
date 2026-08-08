import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Download, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/helpers';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#1e3a5f',
    primaryTextColor: '#f1f5f9',
    primaryBorderColor: '#2563eb',
    lineColor: '#38bdf8',
    secondaryColor: '#064e3b',
    tertiaryColor: '#451a03',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
  },
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
  },
  sequence: {
    useMaxWidth: true,
  },
  gantt: {
    useMaxWidth: true,
  },
});

const MermaidDiagram = ({ definition, className }) => {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const renderDiagram = async () => {
    if (!definition || !containerRef.current) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      const { svg: renderedSvg } = await mermaid.render(id, definition);
      setSvg(renderedSvg);
    } catch (err) {
      console.error('Mermaid rendering error:', err);
      setError('Failed to render diagram. Invalid Mermaid syntax.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    renderDiagram();
  }, [definition]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.3));
  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center min-h-[400px] bg-card rounded-xl border border-border', className)}>
        <Spinner text="Rendering diagram..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center min-h-[400px] bg-card rounded-xl border border-border p-8', className)}>
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
          <RefreshCw className="w-8 h-8 text-error" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">Diagram Error</h3>
        <p className="text-sm text-text-secondary text-center mb-4">{error}</p>
        <Button variant="secondary" onClick={renderDiagram} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('relative bg-card rounded-xl border border-border overflow-hidden', className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background-secondary/50">
        <span className="text-sm font-medium text-text-primary">Flowchart</span>
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
          <button
            onClick={handleDownload}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
            title="Download SVG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ height: '600px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <motion.div
          className="origin-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transition: isPanning ? 'none' : 'transform 0.2s ease-out',
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
};

export default MermaidDiagram;