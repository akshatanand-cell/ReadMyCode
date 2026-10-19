import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  Upload,
  Link as LinkIcon,
  FileArchive,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Code2,
  Zap,
  Folder,
  Search,
  Lock,
  Globe,
  Star,
  RefreshCw,
  ExternalLink,
  GitFork,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useRepoAnalysis } from '@/hooks/useRepoAnalysis';
import { useAuth } from '@/context/AuthContext';
import { dashboardAPI, authAPI } from '@/services/api';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import ProgressBar from '@/components/common/ProgressBar';
import Badge from '@/components/common/Badge';
import GithubConnectModal from '@/components/common/GithubConnectModal';
import { cn } from '@/utils/helpers';
import { MAX_FILE_SIZE, SUPPORTED_ARCHIVE_TYPES } from '@/utils/constants';

const Analyze = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { uploadFromGitHub, uploadFromZip, isLoading, progress } = useRepoAnalysis();
  const [activeTab, setActiveTab] = useState('github');
  const [githubUrl, setGithubUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [urlError, setUrlError] = useState('');
  const [pushToGithub, setPushToGithub] = useState(false);
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('github_token') || '');
  const [customRepoName, setCustomRepoName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const fileInputRef = useRef(null);

  // Vercel-style GitHub Integration State
  const [userGithubRepos, setUserGithubRepos] = useState([]);
  const [loadingGithubRepos, setLoadingGithubRepos] = useState(false);
  const [githubSearchQuery, setGithubSearchQuery] = useState('');
  const [githubFilter, setGithubFilter] = useState('all'); // 'all' | 'public' | 'private'
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [importingRepoUrl, setImportingRepoUrl] = useState(null);

  const fetchUserGithubRepos = async () => {
    setLoadingGithubRepos(true);
    try {
      const res = await authAPI.getGithubRepos();
      setUserGithubRepos(res.data?.repos || []);
    } catch (err) {
      console.warn('Could not fetch GitHub repos:', err.message);
    } finally {
      setLoadingGithubRepos(false);
    }
  };

  useEffect(() => {
    if (user?.hasGithubToken || user?.githubUsername || localStorage.getItem('github_token')) {
      fetchUserGithubRepos();
    }
  }, [user]);

  const handleImportRepo = async (repoUrl) => {
    setImportingRepoUrl(repoUrl);
    try {
      const result = await uploadFromGitHub(repoUrl);
      const repoId = result?._id || result?.id || result?.repo?._id || result?.repo?.id;
      if (repoId) navigate(`/repo/${repoId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setImportingRepoUrl(null);
    }
  };

  const validateGitHubUrl = (url) => {
    const pattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+(?:\.git)?\/?$/;
    return pattern.test(url);
  };

  const handleGitHubSubmit = async (e) => {
    e.preventDefault();
    setUrlError('');
    if (!validateGitHubUrl(githubUrl)) {
      setUrlError('Please enter a valid GitHub repository URL');
      return;
    }
    const result = await uploadFromGitHub(githubUrl);
    const repoId = result?._id || result?.id || result?.repo?._id || result?.repo?.id;
    if (repoId) navigate(`/repo/${repoId}`);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      return;
    }
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!SUPPORTED_ARCHIVE_TYPES.some(t => ext === t) && ext !== '.zip') {
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleZipSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    if (githubToken) {
      localStorage.setItem('github_token', githubToken);
    }
    const result = await uploadFromZip(selectedFile, {
      pushToGithub,
      githubToken,
      customRepoName: customRepoName || selectedFile.name.replace(/\.zip$/i, ''),
      isPrivate,
    });
    const repoId = result?._id || result?.id || result?.repo?._id || result?.repo?.id;
    if (repoId) navigate(`/repo/${repoId}`);
  };

  const [recentRepos, setRecentRepos] = useState([]);

  useEffect(() => {
    let isMounted = true;
    dashboardAPI.getRecent(3)
      .then((res) => {
        if (isMounted) {
          const list = res.data?.repos || [];
          setRecentRepos(Array.isArray(list) ? list : []);
        }
      })
      .catch(() => {
        if (isMounted) setRecentRepos([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm text-accent font-medium">AI-Powered Analysis</span>
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-4">Analyze Your Repository</h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto">
            Upload a GitHub repository or ZIP file to generate documentation, diagrams, and insights automatically.
          </p>
        </motion.div>

        <Card className="mb-8">
          <div className="flex items-center gap-1 p-1 bg-background-secondary rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('github')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all',
                activeTab === 'github' ? 'bg-card text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <Github className="w-4 h-4" />
              GitHub URL
            </button>
            <button
              onClick={() => setActiveTab('zip')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all',
                activeTab === 'zip' ? 'bg-card text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <FileArchive className="w-4 h-4" />
              ZIP Upload
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'github' ? (
              <motion.div
                key="github"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                {/* Global Progress Bar when cloning/analyzing */}
                {(isLoading || importingRepoUrl) && (
                  <div className="py-4 px-4 bg-background-secondary rounded-xl border border-border">
                    <ProgressBar progress={progress} variant="gradient" />
                    <p className="text-center text-sm text-text-secondary mt-2 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      Cloning repository and generating AI documentation...
                    </p>
                  </div>
                )}

                {/* Vercel-style Git Repository Import Section */}
                {(user?.hasGithubToken || user?.githubUsername || userGithubRepos.length > 0) ? (
                  <div className="space-y-4">
                    {/* GitHub Connected Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-background-secondary border border-border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden">
                          {user?.avatar ? (
                            <img src={user.avatar} alt="GitHub" className="w-full h-full object-cover" />
                          ) : (
                            <Github className="w-5 h-5 text-text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-text-primary">
                              {user?.name || 'GitHub User'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              @{user?.githubUsername || 'connected'}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted">Import repositories from your linked GitHub account</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={fetchUserGithubRepos}
                          disabled={loadingGithubRepos}
                          className="p-1.5 text-text-secondary hover:text-text-primary bg-card border border-border rounded-lg text-xs font-medium flex items-center gap-1 transition"
                          title="Refresh repositories"
                        >
                          <RefreshCw className={cn('w-3.5 h-3.5', loadingGithubRepos && 'animate-spin text-primary')} />
                          <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsGithubModalOpen(true)}
                          className="px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary bg-card border border-border rounded-lg font-medium transition"
                        >
                          Switch Account
                        </button>
                      </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search repositories..."
                          value={githubSearchQuery}
                          onChange={(e) => setGithubSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-background-secondary border border-border rounded-lg text-xs sm:text-sm text-text-primary placeholder-text-muted outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="flex items-center gap-1 bg-background-secondary p-1 rounded-lg border border-border self-start">
                        {['all', 'public', 'private'].map((filterKey) => (
                          <button
                            key={filterKey}
                            type="button"
                            onClick={() => setGithubFilter(filterKey)}
                            className={cn(
                              'px-2.5 py-1 text-xs rounded-md capitalize font-medium transition',
                              githubFilter === filterKey
                                ? 'bg-card text-text-primary shadow-sm font-semibold'
                                : 'text-text-muted hover:text-text-primary'
                            )}
                          >
                            {filterKey}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Repositories List */}
                    {loadingGithubRepos ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-2 text-text-muted text-xs">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span>Loading repositories from GitHub...</span>
                      </div>
                    ) : userGithubRepos.length === 0 ? (
                      <div className="py-10 text-center border border-dashed border-border rounded-xl p-6">
                        <Github className="w-8 h-8 text-text-muted mx-auto mb-2" />
                        <p className="text-sm font-medium text-text-primary">No repositories found</p>
                        <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                          Make sure your token has access to your repositories or click switch to connect with a personal access token.
                        </p>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setIsGithubModalOpen(true)}
                          className="mt-3"
                        >
                          Connect with Token
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                        {userGithubRepos
                          .filter((repo) => {
                            const q = githubSearchQuery.toLowerCase();
                            const matchesQ =
                              repo.name.toLowerCase().includes(q) ||
                              (repo.description && repo.description.toLowerCase().includes(q));
                            if (!matchesQ) return false;
                            if (githubFilter === 'public') return !repo.isPrivate;
                            if (githubFilter === 'private') return repo.isPrivate;
                            return true;
                          })
                          .map((repo) => (
                            <div
                              key={repo.id}
                              className="p-3.5 bg-background-secondary/60 hover:bg-background-secondary border border-border rounded-xl flex items-center justify-between gap-4 transition hover:border-primary/40 group"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {repo.isPrivate ? (
                                    <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  ) : (
                                    <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                                  )}
                                  <h4 className="text-sm font-bold text-text-primary truncate">
                                    {repo.fullName || repo.name}
                                  </h4>
                                  <span
                                    className={cn(
                                      'px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                                      repo.isPrivate
                                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    )}
                                  >
                                    {repo.isPrivate ? 'Private' : 'Public'}
                                  </span>
                                </div>
                                <p className="text-xs text-text-muted truncate max-w-md">
                                  {repo.description || 'No description provided'}
                                </p>
                                <div className="flex items-center gap-3 text-[11px] text-text-muted mt-2">
                                  {repo.language && (
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-primary" />
                                      {repo.language}
                                    </span>
                                  )}
                                  {repo.stars > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Star className="w-3 h-3 text-amber-400" />
                                      {repo.stars}
                                    </span>
                                  )}
                                  <span>
                                    Updated {new Date(repo.updatedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="primary"
                                isLoading={importingRepoUrl === repo.url}
                                disabled={isLoading || Boolean(importingRepoUrl)}
                                onClick={() => handleImportRepo(repo.url)}
                                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                                className="shrink-0 font-semibold"
                              >
                                {importingRepoUrl === repo.url ? 'Importing...' : 'Import'}
                              </Button>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Toggle Manual URL Form */}
                    <div className="pt-2 text-center border-t border-border">
                      <button
                        type="button"
                        onClick={() => setShowManualUrl(!showManualUrl)}
                        className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                      >
                        {showManualUrl ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            Hide manual repository URL input
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            Looking for a public open-source repository? Paste URL manually
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Not Connected State - Vercel-Style Hero Banner */
                  <div className="p-6 bg-gradient-to-br from-background-secondary via-card to-background-secondary border border-border rounded-2xl text-center space-y-4">
                    <div className="w-14 h-14 bg-background-secondary border border-border rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-black/10">
                      <Github className="w-8 h-8 text-text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary">Import Git Repository</h3>
                      <p className="text-xs text-text-secondary max-w-md mx-auto mt-1 leading-relaxed">
                        Connect your GitHub account to browse your public and private repositories and import them directly with 1 click, just like Vercel.
                      </p>
                    </div>
                    <div>
                      <Button
                        type="button"
                        onClick={() => setIsGithubModalOpen(true)}
                        className="px-6 py-2.5 font-semibold text-sm shadow-md"
                        leftIcon={<Github className="w-4 h-4" />}
                      >
                        Connect to GitHub
                      </Button>
                    </div>
                  </div>
                )}

                {/* Manual URL Input Form (if toggled or not connected) */}
                {(!user?.hasGithubToken && !user?.githubUsername || showManualUrl) && (
                  <form onSubmit={handleGitHubSubmit} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                        Or Paste Public GitHub Repository URL
                      </label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                          type="text"
                          placeholder="https://github.com/username/repository"
                          value={githubUrl}
                          onChange={(e) => {
                            setGithubUrl(e.target.value);
                            setUrlError('');
                          }}
                          className={cn(
                            'w-full pl-10 pr-4 py-2.5 bg-background-secondary border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono',
                            urlError ? 'border-error' : 'border-border'
                          )}
                        />
                      </div>
                      {urlError && (
                        <div className="flex items-center gap-1.5 mt-2 text-error text-xs">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{urlError}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      isLoading={isLoading}
                      disabled={!githubUrl.trim()}
                      className="w-full text-sm font-semibold"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Analyze Public Repository
                    </Button>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.form
                key="zip"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleZipSubmit}
                className="space-y-4"
              >
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all',
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border-light hover:bg-white/[0.02]'
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip,.tar.gz,.tar"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="w-14 h-14 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-text-primary font-medium mb-1">
                    {selectedFile ? selectedFile.name : 'Drop your ZIP file here'}
                  </p>
                  <p className="text-sm text-text-muted">
                    {selectedFile
                      ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                      : 'or click to browse. Supports .zip, .tar.gz (max 50MB)'}
                  </p>
                </div>

                {selectedFile && (
                  <div className="flex items-center gap-3 p-3 bg-background-secondary rounded-lg">
                    <Folder className="w-5 h-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">{selectedFile.name}</p>
                      <p className="text-xs text-text-muted">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  </div>
                )}

                {isLoading && (
                  <div className="py-4">
                    <ProgressBar progress={progress} variant="gradient" />
                    <p className="text-center text-sm text-text-secondary mt-2 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Extracting and analyzing files...
                    </p>
                  </div>
                )}

                {/* GitHub Auto-Push Integration */}
                <div className="p-4 bg-background-secondary rounded-xl border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={pushToGithub}
                        onChange={(e) => setPushToGithub(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                        <Github className="w-4 h-4 text-primary" />
                        Automatically push to GitHub after analysis
                      </span>
                    </label>
                  </div>

                  {pushToGithub && (
                    <div className="space-y-3 pt-2 border-t border-border/60">
                      {user?.hasGithubToken && (
                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
                          <span className="flex items-center gap-1.5 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Using linked GitHub account ({user.githubUsername || 'Saved Token'})
                          </span>
                          <span className="text-[11px] text-text-muted">Override below if needed</span>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">
                          GitHub Personal Access Token (repo scope)
                        </label>
                        <input
                          type="password"
                          placeholder={user?.hasGithubToken ? '•••••••••••••••••••• (using saved token)' : 'ghp_xxxxxxxxxxxxxxxxxxxx'}
                          value={githubToken}
                          onChange={(e) => setGithubToken(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono bg-card border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                        />
                        <p className="text-[11px] text-text-muted mt-1">
                          Need a token?{' '}
                          <a
                            href="https://github.com/settings/tokens/new?scopes=repo&description=ReadMyCode"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-semibold"
                          >
                            Create one on GitHub in 30s
                          </a>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-text-secondary mb-1">
                            Repository Name
                          </label>
                          <input
                            type="text"
                            placeholder={selectedFile ? selectedFile.name.replace(/\.zip$/i, '') : 'my-awesome-repo'}
                            value={customRepoName}
                            onChange={(e) => setCustomRepoName(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-card border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="flex items-center pt-4">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isPrivate}
                              onChange={(e) => setIsPrivate(e.target.checked)}
                              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-xs text-text-secondary">Make repository private</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" isLoading={isLoading} disabled={!selectedFile} className="w-full">
                  {pushToGithub ? 'Upload, Analyze & Push to GitHub' : 'Upload & Analyze'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </Card>

        {recentRepos.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Your Recent Analyses</h2>
            <div className="space-y-3">
              {recentRepos.map((repo, i) => (
                <motion.div
                  key={repo._id || repo.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card hover className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/repo/${repo._id || repo.id}`)}>
                    <div className="w-10 h-10 bg-background-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Code2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-text-primary truncate">{repo.repoName || repo.name}</h3>
                        <Badge variant={repo.status === 'completed' || repo.status === 'ready' ? 'success' : 'warning'} size="sm">
                          {repo.status || 'ready'}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        {repo.language || 'Codebase'} · {repo.fileCount || repo.files || 0} files · {repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/repo/${repo._id || repo.id}`); }}>
                      View
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        {/* GitHub Connect Modal */}
        <GithubConnectModal
          isOpen={isGithubModalOpen}
          onClose={() => setIsGithubModalOpen(false)}
          onSuccess={() => fetchUserGithubRepos()}
        />
      </div>
    </div>
  );
};

export default Analyze;