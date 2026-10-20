import { useParams } from 'react-router-dom';
import ReadmeViewer from '@/components/ReadmeViewer/ReadmeViewer';
import { Bot } from 'lucide-react';

export default function RepoAgents() {
  const { id } = useParams();

  return (
    <div className="space-y-4">
      <ReadmeViewer
        repoId={id}
        docTitle="AGENTS.md"
        downloadName="AGENTS.md"
        fetchPath={`/docs/${id}/agents`}
        spinnerText="Loading AI Agent specifications & rules..."
        icon={Bot}
        emptyMessage="# AGENTS.md — Agent Rules & Mission Control Constitution&#10;&#10;No agent specifications generated yet."
      />
    </div>
  );
}
