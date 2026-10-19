import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import DebuggerUI from '@/components/DebuggerPanel/DebuggerUI';
import { analysisAPI } from '@/services/api';

export default function RepoDebugger() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleDebug = async (query) => {
    setIsLoading(true);
    try {
      const res = await analysisAPI.getDebugger({
        repoId: id,
        errorTrace: query.error,
        relevantCode: query.context || '',
      });
      return res.data.result?.content || res.data.content || res.data;
    } catch (err) {
      console.error('Debug analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <DebuggerUI onDebug={handleDebug} isLoading={isLoading} />
    </div>
  );
}
