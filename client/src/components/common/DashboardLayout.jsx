import React, { useState } from 'react';
import { Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  Code2,
  GitBranch,
  Network,
  FunctionSquare,
  Bug,
  ArrowLeft,
  ExternalLink,
  Star,
  Copy,
  Check,
  FolderGit2,
} from 'lucide-react';
import { useRepo } from '@/context/RepoContext';
import { cn } from '@/utils/helpers';
import Navbar from './Navbar';
import Badge from './Badge';
import Button from './Button';
import ProgressBar from './ProgressBar';

const repoTabs = [
  { path: 'readme', label: 'README', icon: FileText },
  { path: 'api-docs', label: 'API Docs', icon: Code2 },
  { path: 'flowchart', label: 'Flowchart', icon: GitBranch },
  { path: 'architecture', label: 'Architecture', icon: Network },
  { path: 'functions', label: 'Functions', icon: FunctionSquare },
  { path: 'debugger', label: 'Debugger', icon: Bug },
];

const DashboardLayout = () => {
  const { id } = useParams();
  const location = useLocation();
  const { currentRepo, isAnalyzing, analysisProgress } = useRepo();
  const navigate = useNavigate();
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(128);
  const [isCopied, setIsCopied] = useState(false);

  const currentTab = location.pathname.split('/').pop();
  const isRepoPage = id && location.pathname.includes('/repo/');

  const handleCopyUrl = () => {
    const url = currentRepo?.repoUrl || currentRepo?.githubUrl || window.location.href;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleStarToggle = () => {
    setIsStarred((prev) => !prev);
    setStarCount((prev) => (isStarred ? prev - 1 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-background text-text-primary transition-colors duration-200">
      {/* Global Navbar */}
      <Navbar />

      <div className="pt-16">
        {/* Repo Header - Movable and Non-blocking (scrolls naturally with document flow) */}
        {isRepoPage && currentRepo && (
          <div className="relative border-b border-border bg-card/85 backdrop-blur-md z-10 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="pt-5 pb-0">
                {/* GitHub-style Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => navigate('/dashboard')}
                      leftIcon={<ArrowLeft className="w-4 h-4 text-text-primary" />}
                      className="hover:scale-105 transition-transform"
                      title="Back to Dashboard"
                    />

                    <div className="flex items-center gap-2 flex-wrap">
                      <FolderGit2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <h1 className="text-xl font-bold text-text-primary flex items-center gap-1.5 tracking-tight">
                        <span className="text-text-muted hover:underline cursor-pointer" onClick={() => navigate('/dashboard')}>
                          {currentRepo.owner || 'repo'}
                        </span>
                        <span className="text-text-muted">/</span>
                        <span className="text-text-primary font-semibold">
                          {currentRepo.repoName || currentRepo.name}
                        </span>
                      </h1>

                      <Badge
                        variant={currentRepo.status === 'completed' || currentRepo.status === 'ready' ? 'success' : 'warning'}
                        size="sm"
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium border"
                      >
                        {currentRepo.status || 'Public'}
                      </Badge>
                    </div>
                  </div>

                  {/* GitHub Action Buttons (Star, Copy URL, External Link) */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={handleStarToggle}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-sm',
                        isStarred
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                          : 'bg-background-secondary border-border text-text-secondary hover:text-text-primary hover:bg-border/40'
                      )}
                      title={isStarred ? 'Unstar repository' : 'Star repository'}
                    >
                      <Star className={cn('w-3.5 h-3.5', isStarred && 'fill-amber-400 text-amber-400')} />
                      <span>{isStarred ? 'Starred' : 'Star'}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-border/50 text-[10px] ml-1">
                        {starCount}
                      </span>
                    </button>

                    <button
                      onClick={handleCopyUrl}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background-secondary hover:bg-border/40 text-text-secondary hover:text-text-primary text-xs font-medium transition-all shadow-sm"
                      title="Copy Repository URL"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy URL'}</span>
                    </button>

                    {(currentRepo.repoUrl || currentRepo.githubUrl) && (
                      <a
                        href={currentRepo.repoUrl || currentRepo.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background-secondary hover:bg-border/40 text-text-secondary hover:text-text-primary text-xs font-medium transition-all shadow-sm"
                        title="Open on GitHub"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-primary" />
                        <span className="hidden sm:inline">GitHub</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Analysis Progress */}
                {isAnalyzing && (
                  <div className="mb-4">
                    <ProgressBar progress={analysisProgress} variant="gradient" />
                  </div>
                )}

                {/* GitHub-style Subnav Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pt-1 scrollbar-none border-b border-transparent">
                  {repoTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentTab === tab.path;
                    return (
                      <button
                        key={tab.path}
                        onClick={() => navigate(`/repo/${id}/${tab.path}`)}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap rounded-t-lg',
                          isActive
                            ? 'text-primary border-primary bg-background-secondary/70 font-semibold shadow-sm'
                            : 'text-text-secondary border-transparent hover:text-text-primary hover:border-border hover:bg-background-secondary/30'
                        )}
                      >
                        <Icon className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-text-muted')} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;