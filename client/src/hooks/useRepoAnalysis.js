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

  const uploadFromZip = useCallback(async (file) => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await repoAPI.uploadZip(formData);
      setProgress(100);
      toast.success('Repository uploaded successfully');
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