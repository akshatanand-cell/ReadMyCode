import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Button from './Button';
import Avatar from './Avatar';
import Dropdown from './Dropdown';
import { cn } from '@/utils/helpers';

const Navbar = ({ _onMenuToggle, _isSidebarOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { path: '/', label: 'Overview' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/analyze', label: 'Analyze', auth: true },
    { path: '/dashboard', label: 'Dashboard', auth: true },
    { path: '/history', label: 'History', auth: true },
  ];

  const userDropdownItems = [
    {
      label: 'Profile',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLineline="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      onClick: () => navigate('/profile'),
    },
    { divider: true },
    {
      label: 'Sign out',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLineline="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      onClick: logout,
      danger: true,
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Identity */}
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
            <div className="w-7 h-7 rounded-md bg-text-primary text-background flex items-center justify-center transition-transform group-hover:scale-95">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-text-primary">
              ReadMyCode
            </span>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              if (link.auth && !isAuthenticated) return null;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm px-1 py-0.5',
                    isActive
                      ? 'text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 text-text-secondary hover:text-text-primary rounded-full hover:bg-card border border-transparent hover:border-border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme appearance"
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* GitHub Source Link */}
            <a
              href="https://github.com/akshatanand-cell/ReadMyCode"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-text-secondary hover:text-text-primary rounded-full hover:bg-card border border-transparent hover:border-border transition-colors hidden sm:flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="GitHub repository"
              aria-label="GitHub repository"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/history"
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium transition-colors border',
                    location.pathname === '/history'
                      ? 'bg-card text-text-primary border-border'
                      : 'text-text-secondary hover:text-text-primary hover:bg-card border-transparent'
                  )}
                >
                  History
                </Link>

                <Link
                  to="/profile"
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium transition-colors border',
                    location.pathname === '/profile'
                      ? 'bg-card text-text-primary border-border'
                      : 'text-text-secondary hover:text-text-primary hover:bg-card border-transparent'
                  )}
                >
                  Profile
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="px-2.5 py-1 rounded-full text-xs font-medium text-text-secondary hover:text-error hover:bg-card border border-transparent transition-colors"
                >
                  Sign Out
                </button>

                <div className="h-4 w-[1px] bg-border mx-1 hidden sm:block" />

                <Dropdown
                  trigger={
                    <div className="cursor-pointer p-0.5 rounded-full hover:ring-2 hover:ring-border transition-all">
                      <Avatar name={user?.name || user?.email} size="sm" />
                    </div>
                  }
                  items={userDropdownItems}
                  align="right"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/analyze')}
                >
                  Analyze Code
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-text-secondary hover:text-text-primary rounded-md border border-border"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-2">
          {navLinks.map((link) => {
            if (link.auth && !isAuthenticated) return null;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'block px-3 py-2 rounded-md text-xs font-medium transition-colors',
                  isActive
                    ? 'text-primary bg-background-secondary font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};

export default Navbar;