import React from 'react';
import { useParams } from 'react-router-dom';
import ApiDocsViewer from '@/components/ApiDocsViewer/ApiDocsViewer';

export default function RepoApiDocs() {
  const { id } = useParams();

  return (
    <div className="space-y-4 min-h-[650px]">
      <ApiDocsViewer repoId={id} />
    </div>
  );
}
