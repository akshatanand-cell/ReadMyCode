import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2,
  FileText,
  GitBranch,
  Network,
  FunctionSquare,
  Bug,
  Clock,
  Folder,
  ArrowRight,
  Plus,
  Activity,
} from 'lucide-react';
import { dashboardAPI } from '@/services/api';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { SkeletonCard } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import ContributionHeatmap from '@/components/common/ContributionHeatmap';
import { cn } from '@/utils/helpers';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Card>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-text-secondary mb-1">{label}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
      </div>
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </Card>
);


const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentRepos, setRecentRepos] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recentRes, activityRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getRecent(),
          dashboardAPI.getActivity(),
        ]);
        setStats(statsRes.data);
        setRecentRepos(recentRes.data?.repos || []);
        setActivity(activityRes.data?.activity || []);
      } catch (_error) {
        setStats({
          totalRepos: 0,
          readyRepos: 0,
          failedRepos: 0,
          totalAnalyses: 0,
        });
        setRecentRepos([]);
        setActivity([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    { icon: FileText, label: 'README', color: 'bg-blue-500/10 text-blue-400', path: 'readme' },
    { icon: Code2, label: 'API Docs', color: 'bg-cyan-500/10 text-cyan-400', path: 'api-docs' },
    { icon: GitBranch, label: 'Flowchart', color: 'bg-emerald-500/10 text-emerald-400', path: 'flowchart' },
    { icon: Network, label: 'Architecture', color: 'bg-violet-500/10 text-violet-400', path: 'architecture' },
    { icon: FunctionSquare, label: 'Functions', color: 'bg-amber-500/10 text-amber-400', path: 'functions' },
    { icon: Bug, label: 'Debugger', color: 'bg-rose-500/10 text-rose-400', path: 'debugger' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">Overview of your repositories and analyses</p>
        </div>
        <Button onClick={() => navigate('/analyze')} leftIcon={<Plus className="w-4 h-4" />}>
          New Analysis
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Folder} label="Total Repositories" value={stats?.totalRepos || 0} color="bg-primary/10 text-primary" />
        <StatCard icon={Activity} label="Ready Repos" value={stats?.readyRepos || 0} color="bg-secondary/10 text-secondary" />
        <StatCard icon={FunctionSquare} label="Total Analyses" value={stats?.totalAnalyses || 0} color="bg-accent/10 text-accent" />
        <StatCard icon={Clock} label="Failed / Issues" value={stats?.failedRepos || 0} color="bg-warning/10 text-warning" />
      </div>

      <ContributionHeatmap repos={recentRepos} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Recent Repositories</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/history')} rightIcon={<ArrowRight className="w-4 h-4" />}>
            View All
          </Button>
        </div>

        {recentRepos.length === 0 ? (
          <EmptyState
            icon="folder"
            title="No repositories yet"
            description="Start by analyzing your first repository"
            action={<Button onClick={() => navigate('/analyze')}>Analyze Repository</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recentRepos.map((repo, i) => (
              <motion.div
                key={repo._id || repo.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card hover onClick={() => navigate(`/repo/${repo._id || repo.id}`)}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-background-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Code2 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-text-primary truncate">{repo.repoName || repo.name}</h3>
                        <Badge variant={repo.status === 'completed' || repo.status === 'ready' ? 'success' : 'warning'} size="sm">
                          {repo.status || 'ready'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Code2 className="w-3 h-3" />
                          {repo.language || 'Codebase'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Folder className="w-3 h-3" />
                          {repo.fileCount || repo.files || (repo.fileTree ? repo.fileTree.length : 0)} files
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="grid grid-cols-3 gap-2">
                      {features.slice(0, 3).map((f) => (
                        <button
                          key={f.path}
                          onClick={(e) => { e.stopPropagation(); navigate(`/repo/${repo._id || repo.id}/${f.path}`); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background-secondary hover:bg-white/5 transition-colors text-xs text-text-secondary hover:text-text-primary"
                        >
                          <f.icon className="w-3.5 h-3.5" />
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {features.map((feature) => (
            <button
              key={feature.path}
              onClick={() => navigate('/analyze')}
              className="flex flex-col items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-border-light hover:-translate-y-1 transition-all group"
            >
              <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', feature.color)}>
                <feature.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary">{feature.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activity.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h2>
          <Card>
            <div className="space-y-4">
              {activity.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">{item.action}</p>
                    <p className="text-xs text-text-muted">{item.repo} · {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;