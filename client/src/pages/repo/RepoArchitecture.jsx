import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MermaidDiagram from '@/components/FlowchartViewer/MermaidDiagram';
import ReactFlowDiagram from '@/components/ArchitectureViewer/ReactFlowDiagram';
import Spinner from '@/components/common/Spinner';
import { analysisAPI } from '@/services/api';
import { GitBranch, Network } from 'lucide-react';

export default function RepoArchitecture() {
  const { id } = useParams();
  const [definition, setDefinition] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('mermaid'); // 'mermaid' | 'reactflow'

  useEffect(() => {
    if (id) {
      setLoading(true);
      analysisAPI.getArchitecture(id)
        .then((res) => {
          setDefinition(res.data.architecture || res.data.result?.content || '');
        })
        .catch((err) => {
          console.error('Failed to fetch architecture:', err);
          setError(err.response?.data?.message || 'Failed to generate architecture diagram');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <Spinner text="Generating architecture diagram..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">System Architecture Map</h2>
          <p className="text-sm text-text-secondary mt-1">Explore component hierarchies, service layers, and connectivity</p>
        </div>
        <div className="flex items-center gap-1.5 bg-background-secondary p-1 rounded-xl border border-border">
          <button
            onClick={() => setViewMode('mermaid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'mermaid' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Mermaid Diagram
          </button>
          <button
            onClick={() => setViewMode('reactflow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'reactflow' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Interactive Node Canvas
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {viewMode === 'mermaid' ? (
        <MermaidDiagram definition={definition || `graph TD\n  Client[Frontend Client] --> API[Backend Service]\n  API --> DB[(Database)]`} />
      ) : (
        <ReactFlowDiagram />
      )}
    </div>
  );
}
