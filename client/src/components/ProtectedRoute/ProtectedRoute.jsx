import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';

/**
 * ProtectedRoute - Guards routes that require authentication
 * Redirects to login with return URL, shows loader while auth state initializes
 */
export default function ProtectedRoute({ children, requireAuth = true }) {
  const { user, isLoading, loading } = useAuth();
  const location = useLocation();
  const isAuthLoading = isLoading ?? loading ?? true;

  if (isAuthLoading) {
    return <Loader fullScreen message="Checking authentication..." />;
  }

  // Route requires auth but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Route is guest-only (login/register) but user IS logged in
  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // All checks passed - render the protected content
  return children;
}