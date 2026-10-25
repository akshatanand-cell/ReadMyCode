import { useState, useCallback, useRef, useEffect } from 'react';
import { repoAPI } from '@/services/api';
import toast from 'react-hot-toast';

export const ANALYSIS_STEPS = [
  { id: 1, title: 'Connecting to repository', desc: 'Cloning files and verifying directory tree' },
  { id: 2, title: 'Parsing Abstract Syntax Tree', desc: 'Extracting imports, route handlers, and types' },
  { id: 3, title: 'Tracing call graphs & dependencies', desc: 'Mapping component boundaries and data flows' },
  { id: 4, title: 'Writing production documentation', desc: 'Synthesizing README, architecture diagrams & specs' },
];

export function useRepoAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorDetails, setErrorDetails] = useState(null);
  const timerRef = useRef(null);

  const startStepSimulation = () => {
    setProgress(10);
    setCurrentStep(0);
    let currentPct = 10;
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      currentPct += Math.floor(Math.random() * 8) + 4;
      if (currentPct > 92) currentPct = 92;
      
      setProgress(currentPct);
      if (currentPct < 30) setCurrentStep(0);
      else if (currentPct < 60) setCurrentStep(1);
      else if (currentPct < 85) setCurrentStep(2);
      else setCurrentStep(3);
    }, 1200);
  };

  const stopStepSimulation = (success = true) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (success) {
      setProgress(100);
      setCurrentStep(3);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const categorizeError = (rawMessage = '', statusCode) => {
    const msg = String(rawMessage).toLowerCase();
    
    if (msg.includes('rate limit') || statusCode === 429) {
      return {
        type: 'RATE_LIMIT',
        title: 'API Rate Limit Exceeded',
        message: 'GitHub or AI provider rate limit reached. Connect your GitHub Personal Access Token or wait a few minutes.',
        actionLabel: 'Add GitHub Token',
        actionType: 'token',
      };
    }
    if (msg.includes('not found') || msg.includes('private') || msg.includes('authentication') || statusCode === 403 || statusCode === 401) {
      return {
        type: 'PRIVATE_REPO',
        title: 'Private or Inaccessible Repository',
        message: 'This repository is private or does not exist. Provide a GitHub access token with repository read permissions, or upload as a ZIP.',
        actionLabel: 'Connect GitHub Account',
        actionType: 'auth',
      };
    }
    if (msg.includes('large') || msg.includes('size') || msg.includes('too big') || statusCode === 413) {
      return {
        type: 'REPO_TOO_LARGE',
        title: 'Repository Exceeds Size Limit',
        message: 'The repository is too large for real-time analysis (limit 50MB). Try uploading a ZIP archive containing only the core source directory.',
        actionLabel: 'Upload ZIP Archive',
        actionType: 'zip',
      };
    }
    if (msg.includes('invalid') || msg.includes('url') || msg.includes('format')) {
      return {
        type: 'INVALID_URL',
        title: 'Invalid Repository URL',
        message: 'Please provide a valid GitHub repository URL in the format: https://github.com/owner/repository.',
        actionLabel: 'Try an Example',
        actionType: 'example',
      };
    }
    return {
      type: 'GENERIC',
      title: 'Analysis Failed',
      message: rawMessage || 'An unexpected error occurred while analyzing the codebase. Please try again or test with an example repository.',
      actionLabel: 'Try Again',
      actionType: 'retry',
    };
  };

  const uploadFromGitHub = useCallback(async (url) => {
    setIsLoading(true);
    setErrorDetails(null);
    startStepSimulation();
    
    try {
      const response = await repoAPI.analyzeFromUrl({ repoUrl: url });
      stopStepSimulation(true);
      toast.success('Repository analyzed successfully!');
      
      const repoData = response.data?.repo || response.data;
      if (repoData?._id || repoData?.id) {
        // Persist last analyzed repo for instant resume
        try {
          localStorage.setItem('readmycode_last_analyzed_repo', JSON.stringify({
            id: repoData._id || repoData.id,
            name: repoData.name || repoData.repoName || url.split('/').slice(-2).join('/'),
            url: url,
            timestamp: Date.now(),
          }));
        } catch (storageErr) {}
      }
      return repoData;
    } catch (err) {
      stopStepSimulation(false);
      const serverMessage = err.response?.data?.message || err.message;
      const errorObj = categorizeError(serverMessage, err.response?.status);
      setErrorDetails(errorObj);
      toast.error(errorObj.title);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadFromZip = useCallback(async (file, options = {}) => {
    setIsLoading(true);
    setErrorDetails(null);
    startStepSimulation();
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (options.pushToGithub) formData.append('pushToGithub', 'true');
      if (options.githubToken) formData.append('githubToken', options.githubToken);
      if (options.customRepoName) formData.append('customRepoName', options.customRepoName);
      if (options.isPrivate) formData.append('isPrivate', 'true');

      const response = await repoAPI.uploadZip(formData);
      stopStepSimulation(true);
      
      if (response.data?.github?.htmlUrl) {
        toast.success(`Pushed to GitHub: ${response.data.github.htmlUrl}`, { duration: 6000 });
      } else {
        toast.success('ZIP archive analyzed successfully!');
      }
      
      const repoData = response.data?.repo || response.data;
      if (repoData?._id || repoData?.id) {
        try {
          localStorage.setItem('readmycode_last_analyzed_repo', JSON.stringify({
            id: repoData._id || repoData.id,
            name: repoData.name || options.customRepoName || file.name,
            timestamp: Date.now(),
          }));
        } catch (storageErr) {}
      }
      return repoData;
    } catch (err) {
      stopStepSimulation(false);
      const serverMessage = err.response?.data?.message || err.message;
      const errorObj = categorizeError(serverMessage, err.response?.status);
      setErrorDetails(errorObj);
      toast.error(errorObj.title);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    progress,
    currentStep,
    steps: ANALYSIS_STEPS,
    error: errorDetails?.message || null,
    errorDetails,
    clearError: () => setErrorDetails(null),
    uploadFromGitHub,
    uploadFromZip,
  };
}
