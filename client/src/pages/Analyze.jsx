import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  Upload,
  Link,
  FileArchive,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Code2,
  Zap,
  Folder,
} from 'lucide-react';
import { useRepoAnalysis } from '@/hooks/useRepoAnalysis';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import ProgressBar from '@/components/common/ProgressBar';
import Badge from '@/components/common/Badge';
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

  const recentRepos = [
    { name: 'facebook/react', language: 'TypeScript', stars: '220k', status: 'completed' },
    { name: 'vercel/next.js', language: 'TypeScript', stars: '120k', status: 'completed' },
    { name: 'microsoft/vscode', language: 'TypeScript', stars: '160k', status: 'processing' },
  ];

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
              <motion.form
                key="github"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleGitHubSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    GitHub Repository URL
                  </label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      placeholder="https://github.com/username/repository"
                      value={githubUrl}
                      onChange={(e) => { setGithubUrl(e.target.value); setUrlError(''); }}
                      className={cn(
                        'w-full pl-10 pr-4 py-3 bg-background-secondary border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all',
                        urlError ? 'border-error' : 'border-border'
                      )}
                    />
                  </div>
                  {urlError && (
                    <div className="flex items-center gap-1.5 mt-2 text-error text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{urlError}</span>
                    </div>
                  )}
                </div>

                {isLoading && (
                  <div className="py-4">
                    <ProgressBar progress={progress} variant="gradient" />
                    <p className="text-center text-sm text-text-secondary mt-2 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cloning repository and analyzing structure...
                    </p>
                  </div>
                )}

                <Button type="submit" isLoading={isLoading} className="w-full">
                  Analyze Repository
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.form>
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

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Analyses</h2>
          <div className="space-y-3">
            {recentRepos.map((repo, i) => (
              <motion.div
                key={repo.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card hover className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-background-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Code2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-text-primary">{repo.name}</h3>
                      <Badge variant={repo.status === 'completed' ? 'success' : 'warning'} size="sm">
                        {repo.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted">{repo.language} · {repo.stars} stars</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                    View
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyze;