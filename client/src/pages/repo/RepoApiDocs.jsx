import React from 'react';
import { useParams } from 'react-router-dom';
import ApiDocsViewer from '@/components/ApiDocsViewer/ApiDocsViewer';

export default function RepoApiDocs() {
  const { id } = useParams();

  return (
    <div className="p-6 h-[calc(100vh-100px)]">
      <ApiDocsViewer repoId={id} />
    </div>
  );
}
