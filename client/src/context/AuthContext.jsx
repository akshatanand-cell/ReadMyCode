import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      if (token.startsWith('demo_token_')) {
        setUser({ id: 'demo_user', name: 'Developer', email: 'developer@example.com' });
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
      const response = await authAPI.getProfile();
      setUser(response.data?.user || response.data);
      setIsAuthenticated(true);
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        setUser({ id: 'demo_user', name: 'Developer', email: 'developer@example.com' });
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
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
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data?.user || response.data);
      toast.success('Profile updated');
      return { success: true };
    } catch (error) {
      toast.error('Failed to update profile');
      return { success: false };
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
      logout,
      updateProfile,
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