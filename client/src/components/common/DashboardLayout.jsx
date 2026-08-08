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
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/dashboard')}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  />
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-lg font-semibold text-text-primary">
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
                        className="text-sm text-text-muted hover:text-primary flex items-center gap-1 transition-colors"
                      >
                        {currentRepo.repoUrl || currentRepo.githubUrl}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                {(currentRepo.language || currentRepo.fileTree) && (
                  <Badge variant="secondary">{currentRepo.language || `${currentRepo.fileTree?.length || 0} files`}</Badge>
                )}
              </div>

              {/* Analysis Progress */}
              {isAnalyzing && (
                <div className="mb-4">
                  <ProgressBar progress={analysisProgress} variant="gradient" />
                </div>
              )}

              {/* Tabs */}
              <div className="flex items-center gap-1 -mb-px overflow-x-auto">
                {repoTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.path;
                  return (
                    <button
                      key={tab.path}
                      onClick={() => navigate(`/repo/${id}/${tab.path}`)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                        isActive
                          ? 'text-primary border-primary'
                          : 'text-text-secondary border-transparent hover:text-text-primary hover:border-border-light'
                      )}
                    >
                      <Icon className="w-4 h-4" />
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