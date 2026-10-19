import { useState, useCallback } from 'react';
import { repoAPI } from '@/services/api';
import toast from 'react-hot-toast';

export function useRepoAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFromGitHub = useCallback(async (url) => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    try {
      const response = await repoAPI.analyzeFromUrl({ repoUrl: url });
      setProgress(100);
      toast.success('Repository added successfully');
      return response.data?.repo || response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add repository';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadFromZip = useCallback(async (file, options = {}) => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (options.pushToGithub) formData.append('pushToGithub', 'true');
      if (options.githubToken) formData.append('githubToken', options.githubToken);
      if (options.customRepoName) formData.append('customRepoName', options.customRepoName);
      if (options.isPrivate) formData.append('isPrivate', 'true');

      const response = await repoAPI.uploadZip(formData);
      setProgress(100);
      if (response.data?.github?.htmlUrl) {
        toast.success(`Pushed to GitHub: ${response.data.github.htmlUrl}`, { duration: 6000 });
      } else {
        toast.success('Repository uploaded successfully');
      }
      return response.data?.repo || response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to upload repository';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    progress,
    error,
    uploadFromGitHub,
    uploadFromZip,
  };
}