import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Clock,
  ExternalLink,
  RefreshCw,
  Play,
  Trash2,
  ChevronRight,
  FileCode,
  Folder,
  FileText,
  Code2,
  Network,
  FunctionSquare,
  Bug,
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import Modal from '@/components/common/Modal';
import { useRepo } from '@/context/RepoContext';
import { formatRelativeTime } from '@/utils/helpers';
import { ANALYSIS_STATUS, REPO_TABS } from '@/utils/constants';

const tabIconMap = {
  FileText,
  Code2,
  GitBranch,
  Network,
  FunctionSquare,
  Bug,
};

const RepoOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentRepo, fetchRepoDetails, deleteRepo, analyzeRepo, isLoading } = useRepo();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRepoDetails(id);
    }
  }, [id]);

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setAnalysisProgress(10);
      const interval = setInterval(() => {
        setAnalysisProgress((prev) => (prev >= 90 ? prev : prev + 15));
      }, 500);

      await analyzeRepo(id);
      clearInterval(interval);
      setAnalysisProgress(100);
      setTimeout(() => setIsAnalyzing(false), 500);
    } catch (err) {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRepo(id);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case ANALYSIS_STATUS.COMPLETED:
        return <Badge variant="success">Completed</Badge>;
      case ANALYSIS_STATUS.PROCESSING:
      case ANALYSIS_STATUS.ANALYZING:
        return <Badge variant="warning">Processing</Badge>;
      case ANALYSIS_STATUS.PENDING:
        return <Badge variant="secondary">Pending</Badge>;
      case ANALYSIS_STATUS.FAILED:
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner text="Loading repository..." />
      </div>
    );
  }

  if (!currentRepo) {
    return (
      <EmptyState
        icon="folder"
        title="Repository not found"
        description="The repository you're looking for doesn't exist or you don't have access to it."
        action={
          <Button onClick={() => navigate('/dashboard')} leftIcon={<ChevronRight className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
        {/* Analysis Progress */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <div className="flex items-center gap-3 mb-3">
                <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                <span className="text-sm font-medium text-text-primary">Analysis in progress...</span>
                <span className="text-sm text-text-muted ml-auto">{Math.round(analysisProgress)}%</span>
              </div>
              <div className="w-full h-2 bg-background-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${analysisProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Feature Navigation Cards */}
        {(currentRepo.status === 'ready' || currentRepo.status === 'completed' || currentRepo.status === ANALYSIS_STATUS.COMPLETED) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPO_TABS.map((tab, index) => {
              const Icon = tabIconMap[tab.icon] || FileText;
              return (
                <motion.div
                  key={tab.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/repo/${id}/${tab.path}`}>
                    <Card hover glow className="h-full">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-text-primary">{tab.label}</h3>
                          <p className="text-sm text-text-secondary mt-1">
                            {tab.path === 'readme' && 'Generated README documentation'}
                            {tab.path === 'api-docs' && 'API endpoint documentation'}
                            {tab.path === 'flowchart' && 'Visual flow diagrams'}
                            {tab.path === 'architecture' && 'System architecture diagram'}
                            {tab.path === 'functions' && 'Function explanations'}
                            {tab.path === 'debugger' && 'Interactive debugging tool'}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-muted" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Repo Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileCode className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{currentRepo.fileCount || currentRepo.fileTree?.length || 0}</p>
                <p className="text-sm text-text-secondary">Files</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Folder className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {currentRepo.directoryCount || (currentRepo.fileTree ? currentRepo.fileTree.filter((f) => f.type === 'directory').length : 0)}
                </p>
                <p className="text-sm text-text-secondary">Directories</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{currentRepo.languageCount || 1}</p>
                <p className="text-sm text-text-secondary">Languages</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{currentRepo.analysisDuration || '1.2s'}</p>
                <p className="text-sm text-text-secondary">Analysis Time</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Repository"
        >
          <div className="space-y-4">
            <p className="text-text-secondary">
              Are you sure you want to delete <span className="font-semibold text-text-primary">{currentRepo.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete Repository
              </Button>
            </div>
          </div>
        </Modal>
      </div>
  );
};

export default RepoOverview;