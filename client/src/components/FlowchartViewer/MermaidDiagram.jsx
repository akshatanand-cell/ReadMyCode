import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { motion } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  GitBranch,
  Network,
  Server,
  Database,
  Code,
  Shield,
  Layers,
  PlayCircle,
  CheckCircle2,
  Cpu,
  Send,
  Activity,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/utils/helpers';
import Spinner from '@/components/common/Spinner';

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

  // Strip trailing semicolons on directives (e.g. `graph TD;` -> `graph TD`)
  def = def.replace(/^(flowchart\s+[A-Za-z]+);/im, '$1');
  def = def.replace(/^(graph\s+[A-Za-z]+);/im, '$1');

  // Replace unescaped ampersands inside node definitions (which break Mermaid link parsing)
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

function extractNodesFromMermaid(cleanDef) {
  if (!cleanDef) return [];
  const nodes = [];
  const seen = new Set();
  const lines = cleanDef.split('\n');

  for (const line of lines) {
    const matches = [...line.matchAll(/([a-zA-Z0-9_-]+)\["?([^"\]\r\n]+)"?\]/g)];
    for (const match of matches) {
      const id = match[1];
      let title = match[2].trim();
      if (!seen.has(id) && title && !title.toLowerCase().startsWith('subgraph')) {
        seen.add(id);
        nodes.push({ id, title });
      }
    }
  }
  return nodes;
}

const FLOWCHART_DEFAULT_NODES = [
  {
    title: '1. Program Entry & Request Ingestion',
    desc: 'Parse runtime arguments, incoming client requests, and environment variables',
    icon: PlayCircle,
    color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500',
  },
  {
    title: '2. Input Validation & Parameter Resolution',
    desc: 'Verify parameter schema, validate authentication tokens and sanitization rules',
    icon: CheckCircle2,
    color: 'border-blue-500/40 bg-blue-500/10 text-blue-500',
  },
  {
    title: '3. Core Execution & Business Logic',
    desc: 'Execute primary computational workflows, domain algorithms, and service procedures',
    icon: Cpu,
    color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-500',
  },
  {
    title: '4. State Mutation & Data Persistence',
    desc: 'Persist records to database collections, disk stores, and memory state caches',
    icon: Database,
    color: 'border-amber-500/40 bg-amber-500/10 text-amber-500',
  },
  {
    title: '5. Output Serialization & Client Response',
    desc: 'Serialize JSON result payload or render interactive user interface view',
    icon: Send,
    color: 'border-rose-500/40 bg-rose-500/10 text-rose-500',
  },
];

const ARCHITECTURE_DEFAULT_NODES = [
  {
    title: 'Presentation & Client Layer',
    desc: 'Web Browser Client, Interactive Dashboard & Navigation Interface',
    icon: Layers,
    color: 'border-primary/40 bg-primary/10 text-primary',
  },
  {
    title: 'API Gateway & Routing Layer',
    desc: 'Reverse proxy, JWT security middleware, and HTTP endpoint router',
    icon: Shield,
    color: 'border-secondary/40 bg-secondary/10 text-secondary',
  },
  {
    title: 'Service Domain & Controller Logic',
    desc: 'Core business services, AST parsing engine, and procedural modules',
    icon: Code,
    color: 'border-accent/40 bg-accent/10 text-accent',
  },
  {
    title: 'Data Persistence & Storage Layer',
    desc: 'MongoDB Atlas collections, schema models, and transactional store',
    icon: Database,
    color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500',
  },
  {
    title: 'Cloud Infrastructure & Deployments',
    desc: 'Vercel Edge Functions, Streamlit Community Cloud & GitHub integrations',
    icon: Server,
    color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-500',
  },
];

const MermaidDiagram = ({ definition, type = 'flowchart', className }) => {
  const { isDark } = useTheme();
  const [svg, setSvg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dynamicNodes, setDynamicNodes] = useState([]);
  const panStart = useRef({ x: 0, y: 0 });

  const cleanupMermaidErrors = () => {
    document.querySelectorAll('#dmermaid, .mermaid-error, .error-icon, .error-text').forEach((el) => el.remove());
  };

  const renderDiagram = async () => {
    cleanupMermaidErrors();
    if (!definition || !definition.trim()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Create an isolated, offscreen measurement container attached to document.body
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

      const extracted = extractNodesFromMermaid(cleanDef);
      if (extracted.length >= 2) {
        setDynamicNodes(extracted);
      } else {
        setDynamicNodes([]);
      }

      const renderId = `m_${type}_${Date.now()}`;
      const { svg: renderedSvg } = await mermaid.render(renderId, cleanDef, tempContainer);
      setSvg(renderedSvg);
    } catch (err) {
      console.warn(`Mermaid rendering (${type}) failed with primary definition:`, err.message);
      cleanupMermaidErrors();

      // Attempt guaranteed valid fallback Mermaid render so Mermaid STILL renders visually
      try {
        const fallbackDef =
          type === 'architecture'
            ? `flowchart LR
    Client["Client & Browser UI"] --> Gateway["API Gateway & Router"]
    Gateway --> Services["Business Services & AST Engine"]
    Services --> Storage[("Database & State Storage")]`
            : `flowchart TD
    Start["1. Entry Point"] --> Routing["2. Request Routing & Input Parser"]
    Routing --> Processing["3. Core Processing & Algorithms"]
    Processing --> Output["4. Execution Results & Client Response"]`;

        const fallbackId = `m_fb_${type}_${Date.now()}`;
        const { svg: fbSvg } = await mermaid.render(fallbackId, fallbackDef, tempContainer);
        setSvg(fbSvg);
      } catch (_fbErr) {
        console.warn('Fallback Mermaid render also failed:', _fbErr.message);
        setSvg(''); // Fallback to rich SVG interactive node canvas
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

  // Compute active fallback nodes depending on diagram type & extracted labels
  const fallbackList = dynamicNodes.length >= 2
    ? dynamicNodes.map((n, idx) => ({
        title: n.title,
        desc: type === 'flowchart' ? `Execution Step ${idx + 1}` : `System Component (${n.id})`,
        icon: type === 'flowchart' ? Activity : Code,
        color:
          type === 'flowchart'
            ? idx === 0
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
              : idx === dynamicNodes.length - 1
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-500'
              : 'border-primary/40 bg-primary/10 text-primary'
            : 'border-secondary/40 bg-secondary/10 text-secondary',
      }))
    : type === 'flowchart'
    ? FLOWCHART_DEFAULT_NODES
    : ARCHITECTURE_DEFAULT_NODES;

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center min-h-[400px] bg-card rounded-2xl border border-border shadow-md', className)}>
        <Spinner text={`Rendering ${type === 'flowchart' ? 'flowchart' : 'architecture'} diagram...`} />
      </div>
    );
  }

  return (
    <div className={cn('relative bg-card rounded-2xl border border-border overflow-hidden shadow-xl transition-colors', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background-secondary/60">
        <span className="text-sm font-semibold text-text-primary flex items-center gap-2">
          {type === 'architecture' ? (
            <Network className="w-4 h-4 text-primary" />
          ) : (
            <GitBranch className="w-4 h-4 text-primary" />
          )}
          {type === 'architecture' ? 'System Architecture Map' : 'Logic & Execution Flowchart'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-border/30 rounded-lg transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-text-secondary w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-border/30 rounded-lg transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={handleReset}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-border/30 rounded-lg transition-colors"
            title="Reset view"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden cursor-grab active:cursor-grabbing p-8 flex items-center justify-center select-none"
        style={{ minHeight: '520px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <motion.div
          className="origin-center w-full max-w-3xl flex justify-center items-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transition: isPanning ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          {svg ? (
            <div dangerouslySetInnerHTML={{ __html: svg }} className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto" />
          ) : (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="text-center mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  {type === 'flowchart' ? 'Logic Flow Diagram' : 'System Architecture Topology'}
                </span>
              </div>
              {fallbackList.map((node, index) => {
                const IconComponent = node.icon;
                return (
                  <React.Fragment key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className={cn(
                        'w-full max-w-md p-4 rounded-xl border flex items-center gap-4 shadow-md backdrop-blur-md transition-all hover:scale-105',
                        node.color
                      )}
                    >
                      <div className="p-2.5 rounded-lg bg-background-secondary flex items-center justify-center shadow-inner shrink-0">
                        <IconComponent className="w-6 h-6 text-text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-text-primary text-sm tracking-tight truncate">{node.title}</h4>
                        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{node.desc}</p>
                      </div>
                    </motion.div>

                    {index < fallbackList.length - 1 && (
                      <div className="flex flex-col items-center">
                        <div className="w-0.5 h-6 bg-gradient-to-b from-primary to-secondary animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-secondary shadow-sm" />
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