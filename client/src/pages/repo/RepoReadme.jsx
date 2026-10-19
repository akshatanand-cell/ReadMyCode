import { useParams } from 'react-router-dom';
import ReadmeViewer from '@/components/ReadmeViewer/ReadmeViewer';

export default function RepoReadme() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <ReadmeViewer repoId={id} />
    </div>
  );
}
