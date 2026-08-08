import React from 'react';
import { Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Code2,
  GitBranch,
  Network,
  FunctionSquare,
  Bug,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { useRepo } from '@/context/RepoContext';
import { cn } from '@/utils/helpers';
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

  const currentTab = location.pathname.split('/').pop();
  const isRepoPage = id && location.pathname.includes('/repo/');

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      {/* Repo Header */}
      {isRepoPage && currentRepo && (
        <div className="border-b border-white/10 bg-[#0B101D]/95 backdrop-blur-xl sticky top-16 z-30 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="pt-4 pb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => navigate('/dashboard')}
                    leftIcon={<ArrowLeft className="w-4 h-4 text-indigo-400" />}
                    className="hover:scale-105 transition-transform"
                  />
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                        {currentRepo.repoName || currentRepo.name}
                      </h1>
                      <Badge variant={currentRepo.status === 'completed' || currentRepo.status === 'ready' ? 'success' : 'warning'}>
                        {currentRepo.status}
                      </Badge>
                    </div>
                    {(currentRepo.repoUrl || currentRepo.githubUrl) && (
                      <a
                        href={currentRepo.repoUrl || currentRepo.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-text-secondary hover:text-indigo-400 flex items-center gap-1.5 mt-0.5 transition-colors font-mono"
                      >
                        {currentRepo.repoUrl || currentRepo.githubUrl}
                        <ExternalLink className="w-3 h-3 text-indigo-400" />
                      </a>
                    )}
                  </div>
                </div>
                {(currentRepo.language || currentRepo.fileTree) && (
                  <Badge variant="secondary" className="px-3 py-1 bg-slate-800/80 border-white/10 text-indigo-300 font-medium">
                    {currentRepo.language || `${currentRepo.fileTree?.length || 0} files`}
                  </Badge>
                )}
              </div>

              {/* Analysis Progress */}
              {isAnalyzing && (
                <div className="mb-4">
                  <ProgressBar progress={analysisProgress} variant="gradient" />
                </div>
              )}

              {/* Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none">
                {repoTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.path;
                  return (
                    <button
                      key={tab.path}
                      onClick={() => navigate(`/repo/${id}/${tab.path}`)}
                      className={cn(
                        'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap rounded-t-xl',
                        isActive
                          ? 'text-indigo-400 border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.25)] font-semibold'
                          : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-white/5'
                      )}
                    >
                      <Icon className={cn('w-4 h-4', isActive ? 'text-indigo-400' : 'text-text-muted')} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;