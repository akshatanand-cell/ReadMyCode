import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Code2,
  Clock,
  Trash2,
  ArrowRight,
  Folder,
  GitBranch,
  Calendar,
  SortAsc,
} from 'lucide-react';
import { repoAPI } from '@/services/api';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import SearchBar from '@/components/common/SearchBar';
import FilterChips from '@/components/common/FilterChips';
import EmptyState from '@/components/common/EmptyState';
import { SkeletonCard } from '@/components/common/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';

const filters = [
  { value: 'completed', label: 'Completed', icon: <Code2 className="w-3 h-3" /> },
  { value: 'processing', label: 'Processing', icon: <Clock className="w-3 h-3" /> },
  { value: 'failed', label: 'Failed', icon: <Trash2 className="w-3 h-3" /> },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name', label: 'Name A-Z' },
];

const History = () => {
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const list = response.data?.repos || response.data || [];
        setRepos(list);
      } catch (error) {
        setRepos([
          { _id: '1', name: 'facebook/react', language: 'TypeScript', status: 'completed', updatedAt: '2024-01-15T10:30:00Z', files: 1240, githubUrl: 'https://github.com/facebook/react' },
          { _id: '2', name: 'vercel/next.js', language: 'TypeScript', status: 'completed', updatedAt: '2024-01-14T16:45:00Z', files: 890, githubUrl: 'https://github.com/vercel/next.js' },
          { _id: '3', name: 'microsoft/vscode', language: 'TypeScript', status: 'processing', updatedAt: '2024-01-16T08:20:00Z', files: 5600, githubUrl: 'https://github.com/microsoft/vscode' },
          { _id: '4', name: 'torvalds/linux', language: 'C', status: 'completed', updatedAt: '2024-01-10T12:00:00Z', files: 45000, githubUrl: 'https://github.com/torvalds/linux' },
          { _id: '5', name: 'golang/go', language: 'Go', status: 'failed', updatedAt: '2024-01-08T09:15:00Z', files: 3200, githubUrl: 'https://github.com/golang/go' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, [debouncedSearch, activeFilters]);

  const toggleFilter = (value) => {
    setActiveFilters(prev =>
      prev.includes(value) ? prev.filter(f => f !== value) : [...prev, value]
    );
  };

  const handleDelete = async (id) => {
    try {
      await repoAPI.delete(id);
      setRepos(prev => prev.filter(r => r._id !== id));
    } catch (error) {
      setRepos(prev => prev.filter(r => r._id !== id));
    }
  };

  const filteredRepos = [...repos].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.updatedAt) - new Date(a.updatedAt);
    if (sortBy === 'oldest') return new Date(a.updatedAt) - new Date(b.updatedAt);
    const nameA = a.repoName || a.name || '';
    const nameB = b.repoName || b.name || '';
    if (sortBy === 'name') return nameA.localeCompare(nameB);
    return 0;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">History</h1>
          <p className="text-text-secondary">View and manage your analyzed repositories</p>
        </div>
        <Button onClick={() => navigate('/analyze')} leftIcon={<GitBranch className="w-4 h-4" />}>
          New Analysis
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search repositories..."
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 bg-background-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
          >
            {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      <FilterChips
        filters={filters}
        activeFilters={activeFilters}
        onToggle={toggleFilter}
        onClear={() => setActiveFilters([])}
      />

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filteredRepos.length === 0 ? (
        <EmptyState
          icon="search"
          title="No repositories found"
          description="Try adjusting your search or filters"
          action={<Button onClick={() => { setSearchQuery(''); setActiveFilters([]); }}>Clear Filters</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filteredRepos.map((repo, i) => (
            <motion.div
              key={repo._id || repo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover className="group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-background-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Code2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-text-primary">{repo.repoName || repo.name}</h3>
                      <Badge variant={repo.status === 'completed' || repo.status === 'ready' ? 'success' : repo.status === 'processing' ? 'warning' : 'error'} size="sm">
                        {repo.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Code2 className="w-3 h-3" />
                        {repo.language || 'Code'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Folder className="w-3 h-3" />
                        {repo.files?.toLocaleString() || repo.fileTree?.length || 0} files
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(repo.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/repo/${repo._id || repo.id}`)}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      View
                    </Button>
                    <button
                      onClick={() => handleDelete(repo._id || repo.id)}
                      className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;