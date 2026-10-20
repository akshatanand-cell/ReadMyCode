import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/helpers';

const Layout = () => {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const showSidebar = isAuthenticated;

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary transition-colors duration-200">
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
          className={cn(
            'flex-1 flex flex-col transition-all duration-300',
            showSidebar && isSidebarOpen ? 'ml-[260px]' : showSidebar ? 'ml-[72px]' : ''
          )}
        >
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Layout;