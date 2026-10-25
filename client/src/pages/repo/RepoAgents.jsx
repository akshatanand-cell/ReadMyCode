import { useParams } from 'react-router-dom';
import ReadmeViewer from '@/components/ReadmeViewer/ReadmeViewer';
import { useRepo } from '@/context/RepoContext';
import { Bot } from 'lucide-react';

export default function RepoAgents() {
  const { id } = useParams();
  const { currentRepo } = useRepo();

  return (
    <div className="space-y-4">
      <ReadmeViewer
        repoId={id}
        content={currentRepo?.specDocs?.agents}
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
