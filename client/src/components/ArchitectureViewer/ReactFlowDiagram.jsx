import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Download, Layers } from 'lucide-react';
import { cn } from '@/utils/helpers';

const nodeTypes = {
  service: ServiceNode,
  database: DatabaseNode,
  client: ClientNode,
  api: ApiNode,
  external: ExternalNode,
};

function ServiceNode({ data }) {
  return (
    <div className="px-4 py-3 bg-card border-2 border-primary/50 rounded-xl shadow-lg min-w-[140px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary" />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
          {data.icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{data.label}</p>
          <p className="text-xs text-text-secondary">{data.tech}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary" />
    </div>
  );
}

function DatabaseNode({ data }) {
  return (
    <div className="px-4 py-3 bg-card border-2 border-accent/50 rounded-xl shadow-lg min-w-[140px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-accent" />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
          {data.icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{data.label}</p>
          <p className="text-xs text-text-secondary">{data.tech}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-accent" />
    </div>
  );
}

function ClientNode({ data }) {
  return (
    <div className="px-4 py-3 bg-card border-2 border-secondary/50 rounded-xl shadow-lg min-w-[140px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-secondary" />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center">
          {data.icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{data.label}</p>
          <p className="text-xs text-text-secondary">{data.tech}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-secondary" />
    </div>
  );
}

function ApiNode({ data }) {
  return (
    <div className="px-4 py-3 bg-card border-2 border-warning/50 rounded-xl shadow-lg min-w-[140px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-warning" />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center">
          {data.icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{data.label}</p>
          <p className="text-xs text-text-secondary">{data.tech}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-warning" />
    </div>
  );
}

function ExternalNode({ data }) {
  return (
    <div className="px-4 py-3 bg-card border-2 border-text-muted/50 rounded-xl shadow-lg min-w-[140px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-text-muted" />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-text-muted/20 rounded-lg flex items-center justify-center">
          {data.icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{data.label}</p>
          <p className="text-xs text-text-secondary">{data.tech}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-text-muted" />
    </div>
  );
}

const defaultNodes = [
  {
    id: 'client',
    type: 'client',
    position: { x: 400, y: 50 },
    data: { label: 'React Client', tech: 'Vite + React', icon: '⚛️' },
  },
  {
    id: 'nginx',
    type: 'api',
    position: { x: 400, y: 180 },
    data: { label: 'Nginx', tech: 'Reverse Proxy', icon: '🌐' },
  },
  {
    id: 'api-gateway',
    type: 'api',
    position: { x: 400, y: 310 },
    data: { label: 'API Gateway', tech: 'Express.js', icon: '🔌' },
  },
  {
    id: 'auth-service',
    type: 'service',
    position: { x: 150, y: 440 },
    data: { label: 'Auth Service', tech: 'Node.js + JWT', icon: '🔐' },
  },
  {
    id: 'repo-service',
    type: 'service',
    position: { x: 400, y: 440 },
    data: { label: 'Repo Service', tech: 'Node.js', icon: '📁' },
  },
  {
    id: 'ai-service',
    type: 'service',
    position: { x: 650, y: 440 },
    data: { label: 'AI Service', tech: 'Python + OpenAI', icon: '🤖' },
  },
  {
    id: 'postgres',
    type: 'database',
    position: { x: 275, y: 570 },
    data: { label: 'PostgreSQL', tech: 'Primary DB', icon: '🐘' },
  },
  {
    id: 'redis',
    type: 'database',
    position: { x: 525, y: 570 },
    data: { label: 'Redis', tech: 'Cache + Queue', icon: '⚡' },
  },
  {
    id: 's3',
    type: 'external',
    position: { x: 650, y: 310 },
    data: { label: 'AWS S3', tech: 'File Storage', icon: '☁️' },
  },
];

const defaultEdges = [
  { id: 'e1-2', source: 'client', target: 'nginx', animated: true, style: { stroke: '#38bdf8' } },
  { id: 'e2-3', source: 'nginx', target: 'api-gateway', animated: true, style: { stroke: '#38bdf8' } },
  { id: 'e3-4', source: 'api-gateway', target: 'auth-service', style: { stroke: '#2563eb' } },
  { id: 'e3-5', source: 'api-gateway', target: 'repo-service', style: { stroke: '#2563eb' } },
  { id: 'e3-6', source: 'api-gateway', target: 'ai-service', style: { stroke: '#2563eb' } },
  { id: 'e3-9', source: 'api-gateway', target: 's3', style: { stroke: '#64748b', strokeDasharray: '5,5' } },
  { id: 'e4-7', source: 'auth-service', target: 'postgres', style: { stroke: '#14b8a6' } },
  { id: 'e5-7', source: 'repo-service', target: 'postgres', style: { stroke: '#14b8a6' } },
  { id: 'e5-8', source: 'repo-service', target: 'redis', style: { stroke: '#14b8a6' } },
  { id: 'e6-8', source: 'ai-service', target: 'redis', style: { stroke: '#14b8a6' } },
];

const ReactFlowDiagram = ({ nodes: propNodes, edges: propEdges, className }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(propNodes || defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(propEdges || defaultEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#38bdf8' } }, eds)),
    [setEdges]
  );

  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
    instance.fitView({ padding: 0.2 });
  }, []);

  const handleFitView = () => {
    reactFlowInstance?.fitView({ padding: 0.2, duration: 800 });
  };

  const handleDownload = () => {
    if (!reactFlowInstance) return;
    const viewport = reactFlowInstance.getViewport();
    const canvas = document.querySelector('.react-flow__renderer');
    if (!canvas) return;
    
    // Simple SVG export
    const svgData = canvas.innerHTML;
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('w-full h-[700px] bg-card rounded-xl border border-border', className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          strokeWidth: 2,
        }}
      >
        <Background
          color="#334155"
          gap={20}
          size={1}
          variant="dots"
        />
        <Controls className="!bg-card !border-border !shadow-lg" />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="!bg-card !border-border"
          maskColor="rgba(11, 17, 32, 0.7)"
          nodeColor={(node) => {
            switch (node.type) {
              case 'service': return '#2563eb';
              case 'database': return '#14b8a6';
              case 'client': return '#38bdf8';
              case 'api': return '#f59e0b';
              default: return '#64748b';
            }
          }}
        />
        <Panel position="top-right" className="m-4">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-2 shadow-lg">
            <button
              onClick={handleFitView}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
              title="Fit view"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
              title="Export"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </Panel>
        <Panel position="bottom-center" className="m-4">
          <div className="flex items-center gap-4 bg-card/90 backdrop-blur border border-border rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-text-secondary">Service</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-xs text-text-secondary">Database</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-xs text-text-secondary">Client</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-xs text-text-secondary">API</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default ReactFlowDiagram;