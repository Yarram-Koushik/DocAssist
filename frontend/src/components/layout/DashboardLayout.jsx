import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { NAV_ITEMS, APP_NAME } from '../../lib/constants';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  LogOut, 
  Bell, 
  Shield, 
  HeartPulse, 
  Sparkles,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';

export const Sidebar = ({ isOpen, setOpen }) => {
  const { user, logout } = useAuth();
  
  const navItems = user?.role === 'admin' 
    ? [...NAV_ITEMS, { label: 'Admin Portal', path: '/admin', icon: Shield, section: 'Administration' }] 
    : NAV_ITEMS;

  const clinicalItems = navItems.filter(i => !['/history', '/profile', '/settings', '/admin'].includes(i.path));
  const accountItems = navItems.filter(i => ['/history', '/profile', '/settings', '/admin'].includes(i.path));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden" 
          onClick={() => setOpen(false)} 
        />
      )}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-0 flex flex-col shrink-0", 
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        {/* Sidebar Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-black shadow-sm">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-gray-900 dark:text-gray-100">{APP_NAME}</span>
              <span className="text-[10px] text-gray-400 block -mt-1 font-medium">AI Clinical Assistant</span>
            </div>
          </div>

          <button onClick={() => setOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Clinical Suite Section */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Clinical Tools
            </span>
            <ul className="space-y-0.5 pt-1">
              {clinicalItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center rounded-xl px-3 py-2.5 text-xs font-semibold transition-all group",
                      isActive 
                        ? "bg-primary text-white shadow-xs font-bold" 
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                    )}
                  >
                    <item.icon className="mr-3 h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Account & Records Section */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Patient Records
            </span>
            <ul className="space-y-0.5 pt-1">
              {accountItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center rounded-xl px-3 py-2.5 text-xs font-semibold transition-all group",
                      isActive 
                        ? "bg-primary text-white shadow-xs font-bold" 
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                    )}
                  >
                    <item.icon className="mr-3 h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-3.5 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar initials={user?.name?.[0] || user?.full_name?.[0] || user?.username?.[0] || 'P'} className="h-8 w-8 text-xs font-bold shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                  {user?.full_name || user?.name || user?.username || 'Patient'}
                </span>
                <span className="text-[10px] text-gray-400 truncate">{user?.email}</span>
              </div>
            </div>
            <button 
              onClick={logout} 
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export const Header = ({ setOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.includes('/chat')) return 'Medical Consultations';
    if (pathname.includes('/upload-report')) return 'Lab Report Analyzer';
    if (pathname.includes('/medicine-search')) return 'Medicine & Drug Guide';
    if (pathname.includes('/history')) return 'Health Records History';
    if (pathname.includes('/profile')) return 'Patient Health Profile';
    if (pathname.includes('/settings')) return 'System Settings';
    if (pathname.includes('/admin')) return 'Admin Operations Center';
    return 'Clinical Dashboard';
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-card-dark/80 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="md:hidden p-1.5 -ml-2" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {getPageTitle(location.pathname)}
          </h2>
          <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            DocAssist Live Engine
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Button variant="outline" size="sm" onClick={toggleTheme} className="h-8 px-2.5 gap-1.5 text-xs font-semibold rounded-lg">
          {theme === 'dark' ? <Moon className="h-3.5 w-3.5 text-purple-400" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
          <span className="hidden sm:inline">{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </Button>
      </div>
    </header>
  );
};

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

