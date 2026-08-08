import { Routes, Route } from 'react-router-dom';

// Layouts
import Layout from '@/components/common/Layout';
import DashboardLayout from '@/components/common/DashboardLayout';

// Route Guard
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import Analyze from '@/pages/Analyze';
import Dashboard from '@/pages/Dashboard';
import History from '@/pages/History';
import Profile from '@/pages/Profile';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Help from '@/pages/Help';
import NotFound from '@/pages/NotFound';

// Repo Sub-pages
import RepoOverview from '@/pages/repo/RepoOverview';
import RepoReadme from '@/pages/repo/RepoReadme';
import RepoApiDocs from '@/pages/repo/RepoApiDocs';
import RepoFlowchart from '@/pages/repo/RepoFlowchart';
import RepoArchitecture from '@/pages/repo/RepoArchitecture';
import RepoFunctions from '@/pages/repo/RepoFunctions';
import RepoDebugger from '@/pages/repo/RepoDebugger';

function App() {
  return (
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
      </Route>

      {/* Protected routes with DashboardLayout */}
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

        {/* Repo detail routes with nested feature views */}
        <Route path="/repo/:id" element={<RepoOverview />} />
        <Route path="/repo/:id/readme" element={<RepoReadme />} />
        <Route path="/repo/:id/api-docs" element={<RepoApiDocs />} />
        <Route path="/repo/:id/flowchart" element={<RepoFlowchart />} />
        <Route path="/repo/:id/architecture" element={<RepoArchitecture />} />
        <Route path="/repo/:id/functions" element={<RepoFunctions />} />
        <Route path="/repo/:id/debugger" element={<RepoDebugger />} />
      </Route>

      {/* 404 catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;