import React, { createContext, useContext, useState, useCallback } from 'react';
import { repoAPI, analysisAPI } from '@/services/api';
import toast from 'react-hot-toast';

const RepoContext = createContext();

export function RepoProvider({ children }) {
  const [currentRepo, setCurrentRepo] = useState(null);
  const [repos, setRepos] = useState([]);
  const [analysisResults, setAnalysisResults] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRepoDetails = useCallback(async (id) => {
    if (!id || id === 'undefined') return null;
    setIsLoading(true);
    try {
      const response = await repoAPI.getById(id);
      const repoObj = response.data?.repo || response.data;
      setCurrentRepo(repoObj);
      return repoObj;
    } catch (error) {
      toast.error('Failed to fetch repository');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserRepos = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await repoAPI.getAll();
      const list = response.data?.repos || response.data || [];
      setRepos(list);
      return list;
    } catch (error) {
      toast.error('Failed to fetch repositories');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteRepo = useCallback(async (id) => {
    try {
      await repoAPI.delete(id);
      setRepos((prev) => prev.filter((r) => (r._id || r.id) !== id));
      setCurrentRepo((prev) => (prev && (prev._id || prev.id) === id ? null : prev));
      return true;
    } catch (error) {
      toast.error('Failed to delete repository');
      throw error;
    }
  }, []);

  const analyzeRepo = useCallback(async (id) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    try {
      const response = await repoAPI.analyze(id);
      setAnalysisResults(response.data);
      setAnalysisProgress(100);
      toast.success('Analysis complete!');
      return response.data;
    } catch (error) {
      toast.error('Analysis failed');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const fetchReadme = useCallback(async (repoId) => {
    try {
      const response = await analysisAPI.getReadme(repoId);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch README');
      return null;
    }
  }, []);

  const fetchApiDocs = useCallback(async (repoId) => {
    try {
      const response = await analysisAPI.getApiDocs(repoId);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch API docs');
      return null;
    }
  }, []);

  const fetchFlowchart = useCallback(async (repoId) => {
    try {
      const response = await analysisAPI.getFlowchart(repoId);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch flowchart');
      return null;
    }
  }, []);

  const fetchArchitecture = useCallback(async (repoId) => {
    try {
      const response = await analysisAPI.getArchitecture(repoId);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch architecture');
      return null;
    }
  }, []);

  const fetchFunctions = useCallback(async (repoId) => {
    try {
      const response = await analysisAPI.getFunctions(repoId);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch functions');
      return null;
    }
  }, []);

  const runDebugger = useCallback(async (repoId, errorData) => {
    try {
      const response = await analysisAPI.getDebugger(repoId, errorData);
      return response.data;
    } catch (error) {
      toast.error('Debugger failed');
      return null;
    }
  }, []);

  return (
    <RepoContext.Provider value={{
      currentRepo,
      repos,
      analysisResults,
      isAnalyzing,
      analysisProgress,
      isLoading,
      setCurrentRepo,
      fetchRepoDetails,
      fetchUserRepos,
      deleteRepo,
      analyzeRepo,
      fetchReadme,
      fetchApiDocs,
      fetchFlowchart,
      fetchArchitecture,
      fetchFunctions,
      runDebugger,
    }}>
      {children}
    </RepoContext.Provider>
  );
}

export const useRepo = () => {
  const context = useContext(RepoContext);
  if (!context) throw new Error('useRepo must be used within RepoProvider');
  return context;
};