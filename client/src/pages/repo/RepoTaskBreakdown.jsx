import { useParams } from 'react-router-dom';
import ReadmeViewer from '@/components/ReadmeViewer/ReadmeViewer';
import { useRepo } from '@/context/RepoContext';
import { ListTodo } from 'lucide-react';

export default function RepoTaskBreakdown() {
  const { id } = useParams();
  const { currentRepo } = useRepo();

  return (
    <div className="space-y-4">
      <ReadmeViewer
        repoId={id}
        content={currentRepo?.specDocs?.taskBreakdown}
        docTitle="TASK_BREAKDOWN.md"
        downloadName="TASK_BREAKDOWN.md"
        fetchPath={`/docs/${id}/task-breakdown`}
        spinnerText="Loading Phase breakdown & task roadmap..."
        icon={ListTodo}
        emptyMessage="# TASK_BREAKDOWN.md — Phase Breakdown & Roadmap&#10;&#10;No task roadmap generated yet."
      />
    </div>
  );
}
