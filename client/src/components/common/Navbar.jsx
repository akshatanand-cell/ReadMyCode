import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Menu, X, Bell, Settings, LogOut, User, Sun, Moon, Github, History } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Button from './Button';
import Avatar from './Avatar';
import Dropdown from './Dropdown';
import { cn } from '@/utils/helpers';

const Navbar = ({ onMenuToggle, isSidebarOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isLandingPage = location.pathname === '/';

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard', auth: true },
    { path: '/analyze', label: 'Analyze', auth: true },
    { path: '/history', label: 'History', auth: true },
  ];

  const userDropdownItems = [
    { label: 'Profile', icon: <User className="w-4 h-4" />, onClick: () => navigate('/profile') },
    { label: 'Settings', icon: <Settings className="w-4 h-4" />, onClick: () => navigate('/settings') },
    { divider: true },
    { label: 'Sign out', icon: <LogOut className="w-4 h-4" />, onClick: logout, danger: true },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border shadow-sm transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-all">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-text-primary via-primary to-accent bg-clip-text text-transparent tracking-tight hidden sm:block">
              ReadMyCode
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5 bg-background-secondary p-1.5 rounded-xl border border-border">
            {navLinks.map((link) => {
              if (link.auth && !isAuthenticated) return null;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                    isActive
                      ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-border/30'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Day / Night Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-border/40 rounded-xl transition-all border border-border flex items-center justify-center shadow-sm"
              title={isDark ? 'Switch to Day mode' : 'Switch to Night mode'}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* GitHub Project Link */}
            <a
              href="https://github.com/akshatanand-cell/ReadMyCode"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-border/40 rounded-xl transition-all border border-border hidden sm:flex items-center justify-center shadow-sm"
              title="View on GitHub"
              aria-label="View on GitHub"
            >
              <Github className="w-4 h-4" />
            </a>

            {isAuthenticated ? (
              <>
                {/* Direct Top Bar Action Buttons for History, Profile, Sign Out on Every Page */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    to="/history"
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all border',
                      location.pathname === '/history'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-background-secondary text-text-secondary hover:text-text-primary hover:bg-border/40 border-border'
                    )}
                    title="Analysis History"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">History</span>
                  </Link>

                  <Link
                    to="/profile"
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all border',
                      location.pathname === '/profile'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-background-secondary text-text-secondary hover:text-text-primary hover:bg-border/40 border-border'
                    )}
                    title="User Profile & Settings"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-600 transition-all shadow-sm"
                    title="Sign Out of Account"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>

                <div className="h-5 w-[1px] bg-border mx-0.5 sm:mx-1 hidden md:block" />

                <Dropdown
                  trigger={
                    <div className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-border/30 transition-colors">
                      <Avatar name={user?.name || user?.email} size="sm" />
                      <span className="hidden lg:block text-xs font-semibold text-text-primary truncate max-w-[90px]">
                        {user?.name || user?.email?.split('@')[0]}
                      </span>
                    </div>
                  }
                  items={userDropdownItems}
                  align="right"
                />
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-border/40 rounded-xl border border-border transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border bg-card p-4 space-y-2 shadow-xl"
        >
          <div className="space-y-1">
            {navLinks.map((link) => {
              if (link.auth && !isAuthenticated) return null;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'block px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'text-primary bg-primary/10 font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-border/30'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {isAuthenticated && (
            <div className="pt-2 border-t border-border grid grid-cols-3 gap-2">
              <Link
                to="/history"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-background-secondary border border-border text-xs font-semibold text-text-secondary hover:text-text-primary"
              >
                <History className="w-3.5 h-3.5 text-primary" />
                <span>History</span>
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-background-secondary border border-border text-xs font-semibold text-text-secondary hover:text-text-primary"
              >
                <User className="w-3.5 h-3.5 text-primary" />
                <span>Profile</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-500 hover:bg-rose-600 hover:text-white transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-text-muted">Appearance</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary bg-background-secondary border border-border rounded-lg"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Day Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Night Mode</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;