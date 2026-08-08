import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FunctionCard from '@/components/FunctionExplainer/FunctionCard';
import Spinner from '@/components/common/Spinner';
import { analysisAPI } from '@/services/api';

export default function RepoFunctions() {
  const { id } = useParams();
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      setLoading(true);
      analysisAPI.getFunctions(id)
        .then((res) => {
          setFunctions(res.data.functions || res.data.result?.content || []);
        })
        .catch((err) => {
          console.error('Failed to fetch functions:', err);
          setError(err.response?.data?.message || 'Failed to explain codebase functions');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <Spinner text="Analyzing and explaining functions..." />;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Function Explanations</h2>
        <p className="text-sm text-text-secondary">AI-generated breakdown of key codebase functions.</p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {functions.length === 0 ? (
        <p className="text-text-muted">No functions parsed for this repository.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {functions.map((fn, idx) => (
            <FunctionCard
              key={idx}
              name={fn.functionName || fn.name}
              description={fn.summary || fn.description}
              parameters={fn.parameters}
              returns={typeof fn.returns === 'string' ? { type: fn.returns } : fn.returns}
              filePath={fn.filePath || fn.file}
              lineStart={fn.line || fn.lineStart}
              lineEnd={fn.lineEnd}
              code={fn.code}
              complexity={fn.complexity}
            />
          ))}
        </div>
      )}
    </div>
  );
}
