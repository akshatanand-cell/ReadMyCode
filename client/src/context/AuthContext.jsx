import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('token'));
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      if (token.startsWith('demo_token_')) {
        const demoUser = { id: 'demo_user', name: 'Developer', email: 'developer@example.com' };
        setUser(demoUser);
        localStorage.setItem('user', JSON.stringify(demoUser));
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
      const response = await authAPI.getProfile();
      const userData = response.data?.user || response.data;
      if (userData && userData.id !== 'demo_guest') {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Preserve saved login from localStorage so user is never logged out unexpectedly
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        } catch {
          // ignore
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        toast.error('Backend offline - started local session. Run server for full pipeline.');
        const fallbackUser = {
          id: 'demo_user_' + Date.now(),
          name: credentials.email ? credentials.email.split('@')[0] : 'User',
          email: credentials.email || 'user@example.com',
        };
        const fallbackToken = 'demo_token_' + Date.now();
        localStorage.setItem('token', fallbackToken);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        setUser(fallbackUser);
        setIsAuthenticated(true);
        return { success: true };
      }

      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        toast.error('Backend offline - started local session. Run server for full pipeline.');
        const fallbackUser = {
          id: 'demo_user_' + Date.now(),
          name: data.name || (data.email ? data.email.split('@')[0] : 'User'),
          email: data.email || 'user@example.com',
        };
        const fallbackToken = 'demo_token_' + Date.now();
        localStorage.setItem('token', fallbackToken);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        setUser(fallbackUser);
        setIsAuthenticated(true);
        return { success: true };
      }

      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data?.user || response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Profile updated');
      return { success: true };
    } catch (error) {
      toast.error('Failed to update profile');
      return { success: false };
    }
  };

  const loginWithGithub = async (data) => {
    try {
      const response = await authAPI.githubLogin(data);
      const { token, user: loggedUser, message } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      if (loggedUser.githubUsername) {
        localStorage.setItem('github_username', loggedUser.githubUsername);
      }
      setUser(loggedUser);
      setIsAuthenticated(true);
      toast.success(message || `Welcome, ${loggedUser.name}!`);
      return { success: true, user: loggedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'GitHub connection failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      loading: isLoading,
      isAuthenticated,
      login,
      register,
      loginWithGithub,
      logout,
      updateProfile,
      checkAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};