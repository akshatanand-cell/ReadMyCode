import { useParams } from 'react-router-dom';
import ReadmeViewer from '@/components/ReadmeViewer/ReadmeViewer';
import { useRepo } from '@/context/RepoContext';

export default function RepoReadme() {
  const { id } = useParams();
  const { currentRepo } = useRepo();

  return (
    <div className="space-y-4">
      <ReadmeViewer repoId={id} content={currentRepo?.specDocs?.readme} />
    </div>
  );
}
