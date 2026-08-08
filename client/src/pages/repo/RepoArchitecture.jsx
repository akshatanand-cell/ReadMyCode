import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MermaidDiagram from '@/components/FlowchartViewer/MermaidDiagram';
import Spinner from '@/components/common/Spinner';
import { analysisAPI } from '@/services/api';

export default function RepoArchitecture() {
  const { id } = useParams();
  const [definition, setDefinition] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-text-primary">System Architecture Map</h2>
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}
      <MermaidDiagram definition={definition || `graph TD\n  Client[Frontend Client] --> API[Backend Service]\n  API --> DB[(Database)]`} />
    </div>
  );
}
