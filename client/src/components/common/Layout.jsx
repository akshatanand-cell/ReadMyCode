import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import CookieConsentBanner from './CookieConsentBanner';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/helpers';

const Layout = () => {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const showSidebar = isAuthenticated;

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary transition-colors duration-200">
      {/* Keyboard Accessibility: Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-400 focus:text-black focus:font-bold focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      <Navbar
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="pt-16 flex-1 flex flex-col">
        {showSidebar && (
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}
        <main
          id="main-content"
          tabIndex="-1"
          className={cn(
            'flex-1 flex flex-col transition-all duration-300 outline-none',
            showSidebar && isSidebarOpen ? 'ml-[260px]' : showSidebar ? 'ml-[72px]' : ''
          )}
        >
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>

      {/* Global Interactive Cookie Consent Banner */}
      <CookieConsentBanner />
    </div>
  );
};

export default Layout;