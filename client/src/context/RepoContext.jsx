import { getDemoRepo } from '@/utils/demoRepos';
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

    // 0. Interactive Demo Sandbox Check (Instant unauthenticated rendering)
    const demo = getDemoRepo(id);
    if (demo) {
      setCurrentRepo(demo);
      setIsLoading(false);
      return demo;
    }

    // 1. Instant cache check to eliminate blank screen & latency
    let cachedRepo = null;
    try {
      const raw = localStorage.getItem(`rmc_repo_${id}`) || localStorage.getItem('readmycode_last_analyzed_full_repo');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (String(parsed._id || parsed.id) === String(id) || !parsed._id)) {
          cachedRepo = parsed;
          setCurrentRepo(parsed);
        }
      }
    } catch (_e) {}

    try {
      const response = await repoAPI.getById(id);
      const repoObj = response.data?.repo || response.data;
      if (repoObj) {
        setCurrentRepo(repoObj);
        try {
          localStorage.setItem(`rmc_repo_${id}`, JSON.stringify(repoObj));
          localStorage.setItem(`rmc_repo_${repoObj._id || repoObj.id}`, JSON.stringify(repoObj));
          localStorage.setItem('readmycode_last_analyzed_full_repo', JSON.stringify(repoObj));
        } catch (_e) {}
        return repoObj;
      }
    } catch (error) {
      if (cachedRepo) {
        return cachedRepo;
      }
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
      const payload = typeof errorData === 'object'
        ? { repoId, ...errorData }
        : { repoId, errorTrace: errorData };
      const response = await analysisAPI.getDebugger(payload);
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