import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReadmeViewer from '@/components/ReadmeViewer/ReadmeViewer';
import Spinner from '@/components/common/Spinner';

export default function RepoReadme() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <ReadmeViewer repoId={id} />
    </div>
  );
}
