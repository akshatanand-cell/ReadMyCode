import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import Layout from '@/components/common/Layout';
import DashboardLayout from '@/components/common/DashboardLayout';
import Spinner from '@/components/common/Spinner';

// Route Guard
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';

// Eager load Home for optimal First Contentful Paint
import Home from '@/pages/Home';

// Lazy load secondary marketing and auth pages
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const GithubCallback = lazy(() => import('@/pages/GithubCallback'));
const Terms = lazy(() => import('@/pages/Terms'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Help = lazy(() => import('@/pages/Help'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Lazy load dashboard pages
const Analyze = lazy(() => import('@/pages/Analyze'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const History = lazy(() => import('@/pages/History'));
const Profile = lazy(() => import('@/pages/Profile'));

// Lazy load heavy repository feature views
const RepoOverview = lazy(() => import('@/pages/repo/RepoOverview'));
const RepoReadme = lazy(() => import('@/pages/repo/RepoReadme'));
const RepoApiDocs = lazy(() => import('@/pages/repo/RepoApiDocs'));
const RepoFlowchart = lazy(() => import('@/pages/repo/RepoFlowchart'));
const RepoArchitecture = lazy(() => import('@/pages/repo/RepoArchitecture'));
const RepoAgents = lazy(() => import('@/pages/repo/RepoAgents'));
const RepoTaskBreakdown = lazy(() => import('@/pages/repo/RepoTaskBreakdown'));
const RepoFunctions = lazy(() => import('@/pages/repo/RepoFunctions'));
const RepoDebugger = lazy(() => import('@/pages/repo/RepoDebugger'));

function SuspenseFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner text="Loading ReadMyCode..." />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        {/* Public routes with main Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/help" element={<Help />} />
        </Route>

        {/* Auth routes (guest-only) */}
        <Route element={<Layout />}>
          <Route
            path="/login"
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <ProtectedRoute requireAuth={false}>
                <Register />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <ProtectedRoute requireAuth={false}>
                <ForgotPassword />
              </ProtectedRoute>
            }
          />
          <Route path="/auth/github/callback" element={<GithubCallback />} />
        </Route>

        {/* Protected user dashboard routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Public / Shared Repository Documentation Workspace (Read-only for visitors, interactive for owners) */}
        <Route element={<DashboardLayout />}>
          <Route path="/repo/:id" element={<RepoOverview />} />
          <Route path="/repo/:id/readme" element={<RepoReadme />} />
          <Route path="/repo/:id/architecture" element={<RepoArchitecture />} />
          <Route path="/repo/:id/agents" element={<RepoAgents />} />
          <Route path="/repo/:id/task-breakdown" element={<RepoTaskBreakdown />} />
          <Route path="/repo/:id/flowchart" element={<RepoFlowchart />} />
          <Route path="/repo/:id/api-docs" element={<RepoApiDocs />} />
          <Route path="/repo/:id/functions" element={<RepoFunctions />} />
          <Route path="/repo/:id/debugger" element={<RepoDebugger />} />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
