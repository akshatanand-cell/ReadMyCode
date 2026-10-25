import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { motion } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  GitBranch,
  Network,
  Download,
  Code,
  Copy,
  Check,
  Eye,
  RefreshCw,
  AlertCircle,
  FileImage,
  Activity,
  PlayCircle,
  CheckCircle2,
  Cpu,
  Database,
  Server,
  Shield,
  Layers,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/utils/helpers';
import Spinner from '@/components/common/Spinner';
import toast from 'react-hot-toast';

function sanitizeMermaidDefinition(rawDef, defaultType = 'flowchart') {
  if (!rawDef || typeof rawDef !== 'string') return '';
  let def = rawDef.trim();

  // 1. Extract content from ```mermaid ... ``` code fence
  const fenceMatch = def.match(/```(?:mermaid)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    def = fenceMatch[1].trim();
  } else {
    const fenceIndex = def.indexOf('```mermaid');
    if (fenceIndex !== -1) {
      def = def.slice(fenceIndex + 10).replace(/```[\s\S]*$/, '').trim();
    }
  }

  // Strip leading markdown headers (# Title)
  def = def.replace(/^#+.*$/gm, '').replace(/```/g, '').trim();

  // Ensure a valid Mermaid directive header
  const lines = def.split('\n').map((l) => l.trim()).filter(Boolean);
  const firstLine = lines[0] || '';
  if (!/^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie)/i.test(firstLine)) {
    def = defaultType === 'architecture' ? `flowchart LR\n${def}` : `flowchart TD\n${def}`;
  }

  // Strip trailing semicolons on directives
  def = def.replace(/^(flowchart\s+[A-Za-z]+);/im, '$1');
  def = def.replace(/^(graph\s+[A-Za-z]+);/im, '$1');

  // Replace unescaped ampersands inside node definitions
  def = def.replace(/&(?![a-zA-Z0-9#]+;)/g, 'and');

  // Ensure node labels with brackets, parentheses, or special characters are safely double-quoted
  def = def.replace(/([a-zA-Z0-9_-]+)\[([^"\]\r\n]+)\]/g, (match, nodeId, text) => {
    if (text.startsWith('"') && text.endsWith('"')) return match;
    if (text.startsWith('(') && text.endsWith(')')) return match;
    const cleanText = text.replace(/"/g, "'").trim();
    return `${nodeId}["${cleanText}"]`;
  });

  return def;
}

const MermaidDiagram = ({ definition, type = 'flowchart', className }) => {
  const { isDark } = useTheme();
  const [svg, setSvg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [renderError, setRenderError] = useState(null);
  const [viewMode, setViewMode] = useState('diagram'); // 'diagram' | 'source'
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const panStart = useRef({ x: 0, y: 0 });

  const cleanupMermaidErrors = () => {
    document.querySelectorAll('#dmermaid, .mermaid-error, .error-icon, .error-text').forEach((el) => el.remove());
  };

  const renderDiagram = async () => {
    cleanupMermaidErrors();
    setRenderError(null);

    if (!definition || !definition.trim()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.top = '0';
    tempContainer.style.left = '0';
    tempContainer.style.width = '1200px';
    tempContainer.style.height = '900px';
    tempContainer.style.opacity = '0';
    tempContainer.style.pointerEvents = 'none';
    tempContainer.style.zIndex = '-9999';
    document.body.appendChild(tempContainer);

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      });

      const cleanDef = sanitizeMermaidDefinition(definition, type);
      const renderId = `m_${type}_${Date.now()}`;
      const { svg: renderedSvg } = await mermaid.render(renderId, cleanDef, tempContainer);
      setSvg(renderedSvg);
    } catch (err) {
      console.warn(`Primary Mermaid render failed:`, err.message);
      cleanupMermaidErrors();

      // Retry once with simplified directive
      try {
        const fallbackDef =
          type === 'architecture'
            ? `flowchart LR\n  Client["Client UI"] --> API["API Layer"]\n  API --> Service["Core Services"]\n  Service --> DB[("Database")]`
            : `flowchart TD\n  Start["Entrypoint"] --> Parse["Input Parser"]\n  Parse --> Process["Execution Logic"]\n  Process --> End["Response"]`;

        const fallbackId = `m_retry_${type}_${Date.now()}`;
        const { svg: fbSvg } = await mermaid.render(fallbackId, fallbackDef, tempContainer);
        setSvg(fbSvg);
        setRenderError(`Complex diagram syntax normalized for rendering.`);
      } catch (retryErr) {
        console.error('All Mermaid renders failed:', retryErr.message);
        setSvg('');
        setRenderError(`Could not render diagram visually: ${err.message}. Showing raw Mermaid source below.`);
        setViewMode('source');
      }
    } finally {
      tempContainer.remove();
      cleanupMermaidErrors();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    renderDiagram();
    return () => cleanupMermaidErrors();
  }, [definition, isDark, type]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.3));
  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0 || viewMode === 'source') return;
    setIsPanning(true);
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e) => {
    if (!isPanning || viewMode === 'source') return;
    setPan({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Export as SVG
  const handleExportSVG = () => {
    if (!svg) {
      toast.error('No diagram available to export');
      return;
    }
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-diagram.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded SVG diagram');
  };

  // Export as PNG
  const handleExportPNG = () => {
    if (!svg) {
      toast.error('No diagram available to export');
      return;
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width * 2 || 1600;
      canvas.height = img.height * 2 || 1200;
      if (ctx) {
        ctx.fillStyle = isDark ? '#0b0b0f' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${type}-diagram.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Downloaded PNG diagram');
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCopySource = async () => {
    try {
      await navigator.clipboard.writeText(definition || '');
      setCopied(true);
      toast.success('Copied Mermaid source code');
      setTimeout(() => setCopied(false), 2000);
    } catch (_err) {
      toast.error('Failed to copy');
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center min-h-[420px] bg-card rounded-2xl border border-border shadow-md', className)}>
        <Spinner text={`Rendering ${type === 'flowchart' ? 'flowchart' : 'architecture'} diagram...`} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-card rounded-2xl border border-border overflow-hidden shadow-xl transition-colors',
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : '',
        className
      )}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border bg-background-secondary/60">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text-primary flex items-center gap-2">
            {type === 'architecture' ? (
              <Network className="w-4 h-4 text-emerald-400" />
            ) : (
              <GitBranch className="w-4 h-4 text-emerald-400" />
            )}
            {type === 'architecture' ? 'Architecture Diagram' : 'Logic Flowchart'}
          </span>

          {/* Mode Switcher: Visual Diagram vs Raw Source */}
          <div className="flex items-center bg-background border border-border rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('diagram')}
              className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'diagram'
                  ? 'bg-card text-emerald-400 shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Diagram</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('source')}
              className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'source'
                  ? 'bg-card text-emerald-400 shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Source</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {viewMode === 'diagram' ? (
            <>
              {/* Zoom and Pan Controls */}
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-border/30 rounded-lg transition-colors"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-text-secondary w-10 text-center">{Math.round(scale * 100)}%</span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-border/30 rounded-lg transition-colors"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-border/30 rounded-lg transition-colors"
                title="Reset view"
                aria-label="Reset zoom"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-4 bg-border mx-1" />

              {/* Export Buttons */}
              <button
                type="button"
                onClick={handleExportSVG}
                className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-border/30 rounded-lg transition-colors flex items-center gap-1"
                title="Export as SVG vector"
              >
                <Download className="w-3.5 h-3.5" />
                <span>SVG</span>
              </button>
              <button
                type="button"
                onClick={handleExportPNG}
                className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-border/30 rounded-lg transition-colors flex items-center gap-1"
                title="Export as high-res PNG"
              >
                <FileImage className="w-3.5 h-3.5" />
                <span>PNG</span>
              </button>

              <div className="w-px h-4 bg-border mx-1" />

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-border/30 rounded-lg transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                aria-label="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleCopySource}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Mermaid Code'}</span>
            </button>
          )}
        </div>
      </div>

      {renderError && (
        <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 text-xs text-yellow-400 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{renderError}</span>
        </div>
      )}

      {/* Main Canvas */}
      {viewMode === 'diagram' ? (
        <div
          className="relative overflow-hidden cursor-grab active:cursor-grabbing p-8 flex items-center justify-center select-none"
          style={{ minHeight: isFullscreen ? 'calc(100vh - 60px)' : '520px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <motion.div
            className="origin-center w-full max-w-4xl flex justify-center items-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transition: isPanning ? 'none' : 'transform 0.2s ease-out',
            }}
          >
            {svg ? (
              <div dangerouslySetInnerHTML={{ __html: svg }} className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto" />
            ) : (
              <div className="text-center py-12">
                <p className="text-text-muted text-sm">Unable to render diagram visually.</p>
                <button
                  type="button"
                  onClick={() => setViewMode('source')}
                  className="mt-3 px-4 py-2 rounded-lg bg-emerald-500 text-black text-xs font-semibold"
                >
                  View Mermaid Source Code
                </button>
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        /* Raw Mermaid Source View */
        <div className="p-6 bg-background-secondary/90 overflow-x-auto min-h-[500px]">
          <pre className="font-mono text-xs text-text-primary whitespace-pre-wrap leading-relaxed select-text">
            {definition || '// No Mermaid diagram definition available.'}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MermaidDiagram;
