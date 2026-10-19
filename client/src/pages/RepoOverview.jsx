import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Clock,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  FileCode,
  Folder,
  FileText,
  Code2,
  Network,
  FunctionSquare,
  Bug,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import Modal from '@/components/common/Modal';
import { useRepo } from '@/context/RepoContext';
import { useAuth } from '@/context/AuthContext';
import { repoAPI } from '@/services/api';
import toast from 'react-hot-toast';
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
  const { currentRepo, fetchRepoDetails, deleteRepo, isLoading } = useRepo();
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  const [pushRepoName, setPushRepoName] = useState('');
  const [pushToken, setPushToken] = useState('');
  const [isPrivateRepo, setIsPrivateRepo] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRepoDetails(id);
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteRepo(id);
      navigate('/dashboard');
    } catch (_err) {
      console.error(_err);
    }
  };

  const openPushModal = () => {
    setPushRepoName(currentRepo?.name || currentRepo?.repoName || 'repository');
    setIsPushModalOpen(true);
  };

  const handlePushToGithub = async (e) => {
    e.preventDefault();
    if (!user?.hasGithubToken && !pushToken) {
      toast.error('Please enter a GitHub Personal Access Token');
      return;
    }
    setIsPushing(true);
    try {
      const res = await repoAPI.pushToGithub(id, {
        repoName: pushRepoName,
        githubToken: pushToken || undefined,
        isPrivate: isPrivateRepo,
      });
      toast.success(res.data.message || 'Successfully exported and pushed to GitHub!');
      setIsPushModalOpen(false);
      fetchRepoDetails(id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to push repository to GitHub');
    } finally {
      setIsPushing(false);
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

        {/* GitHub Export Banner */}
        {(!currentRepo?.repoUrl?.startsWith('http') && !currentRepo?.githubUrl?.startsWith('http')) ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-primary/30 rounded-2xl p-5 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-text-primary">
                      Uploaded ZIP Project
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/15 text-primary border border-primary/25">
                      Ready for GitHub Export
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    Create a new repository under your GitHub account and push all extracted source files in one click.
                  </p>
                </div>
              </div>
              <Button
                onClick={openPushModal}
                variant="primary"
                size="sm"
                leftIcon={<GitBranch className="w-4 h-4" />}
                className="shrink-0 shadow-md shadow-primary/25"
              >
                Push to GitHub
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 text-xs text-text-secondary">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="shrink-0 font-medium text-text-primary">GitHub Repository:</span>
              <a
                href={currentRepo.repoUrl || currentRepo.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-mono truncate"
              >
                {currentRepo.repoUrl || currentRepo.githubUrl}
              </a>
            </div>
            <a
              href={currentRepo.repoUrl || currentRepo.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-medium shrink-0 ml-3"
            >
              Open on GitHub <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Feature Navigation Cards */}
        {(currentRepo.status === 'ready' || currentRepo.status === 'completed' || currentRepo.status === ANALYSIS_STATUS.COMPLETED) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                    <Card hover glow className="h-full border border-border bg-card backdrop-blur-xl hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 group transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 border border-primary/25 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-primary transition-all duration-300 shadow-md">
                          <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">{tab.label}</h3>
                          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                            {tab.path === 'readme' && 'AI-generated markdown documentation'}
                            {tab.path === 'api-docs' && 'Structured RESTful API endpoints'}
                            {tab.path === 'flowchart' && 'Interactive visual execution flow'}
                            {tab.path === 'architecture' && 'Component architecture diagram'}
                            {tab.path === 'functions' && 'Deep function code breakdowns'}
                            {tab.path === 'debugger' && 'AI-assisted code debugger'}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Repo Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Card className="border border-border bg-card backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shadow-inner">
                <FileCode className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-text-primary tracking-tight">{currentRepo.fileCount || currentRepo.fileTree?.length || 0}</p>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Total Files</p>
              </div>
            </div>
          </Card>
          <Card className="border border-border bg-card backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/10 border border-secondary/20 rounded-xl flex items-center justify-center shadow-inner">
                <Folder className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-text-primary tracking-tight">
                  {currentRepo.directoryCount || (currentRepo.fileTree ? currentRepo.fileTree.filter((f) => f.type === 'directory').length : 0)}
                </p>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Directories</p>
              </div>
            </div>
          </Card>
          <Card className="border border-border bg-card backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center shadow-inner">
                <GitBranch className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-text-primary tracking-tight">{currentRepo.languageCount || 1}</p>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Languages</p>
              </div>
            </div>
          </Card>
          <Card className="border border-border bg-card backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-inner">
                <Clock className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-text-primary tracking-tight">
                  {currentRepo.analysisDuration || (currentRepo.status === 'completed' || currentRepo.status === 'ready' ? 'Done' : 'Active')}
                </p>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Analysis Status</p>
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

        {/* Push to GitHub Modal */}
        <Modal
          isOpen={isPushModalOpen}
          onClose={() => !isPushing && setIsPushModalOpen(false)}
          title="Export Project to GitHub"
        >
          <form onSubmit={handlePushToGithub} className="space-y-4">
            <p className="text-sm text-text-secondary">
              This will initialize a Git repository for this project and push all source files directly to your GitHub profile.
            </p>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Repository Name
              </label>
              <input
                type="text"
                required
                value={pushRepoName}
                onChange={(e) => setPushRepoName(e.target.value)}
                className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary font-mono"
                placeholder="my-awesome-repo"
              />
            </div>

            {!user?.hasGithubToken && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-text-primary">
                    GitHub Personal Access Token
                  </label>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=ReadMyCode%20Export"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-primary hover:underline"
                  >
                    Generate token &rarr;
                  </a>
                </div>
                <input
                  type="password"
                  required
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={pushToken}
                  onChange={(e) => setPushToken(e.target.value)}
                  className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary font-mono"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Tip: Save this token in your <Link to="/profile" className="text-primary hover:underline">Profile</Link> to skip entering it each time.
                </p>
              </div>
            )}

            {user?.hasGithubToken && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Using linked account ({user.githubUsername || 'Saved Token'})</span>
                </div>
                <Link to="/profile" className="text-xs text-primary hover:underline shrink-0">
                  Manage
                </Link>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="modalPrivateCheckbox"
                checked={isPrivateRepo}
                onChange={(e) => setIsPrivateRepo(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary bg-background-secondary border-border"
              />
              <label htmlFor="modalPrivateCheckbox" className="text-xs text-text-secondary cursor-pointer select-none">
                Make this repository private on GitHub
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsPushModalOpen(false)}
                disabled={isPushing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isPushing}
              >
                {isPushing ? 'Exporting & Pushing...' : 'Push to GitHub'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
  );
};

export default RepoOverview;