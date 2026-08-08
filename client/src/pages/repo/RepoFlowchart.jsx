import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MermaidDiagram from '@/components/FlowchartViewer/MermaidDiagram';
import Spinner from '@/components/common/Spinner';
import { analysisAPI } from '@/services/api';

export default function RepoFlowchart() {
  const { id } = useParams();
  const [definition, setDefinition] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      setLoading(true);
      analysisAPI.getFlowchart(id)
        .then((res) => {
          setDefinition(res.data.flowchart || res.data.result?.content || '');
        })
        .catch((err) => {
          console.error('Failed to fetch flowchart:', err);
          setError(err.response?.data?.message || 'Failed to generate flowchart');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <Spinner text="Generating flowchart diagram..." />;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-text-primary">Flowchart & Logic Diagrams</h2>
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}
      <MermaidDiagram definition={definition || `graph TD\n  A[Repository Entry] --> B[Flowchart Analysis]`} />
    </div>
  );
}
