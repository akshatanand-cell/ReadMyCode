import { useParams } from 'react-router-dom';
import ReadmeViewer from '@/components/ReadmeViewer/ReadmeViewer';
import { ListTodo } from 'lucide-react';

export default function RepoTaskBreakdown() {
  const { id } = useParams();

  return (
    <div className="space-y-4">
      <ReadmeViewer
        repoId={id}
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
