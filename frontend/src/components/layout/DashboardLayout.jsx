import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, Bell, Search, ShieldAlert } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, role } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 h-16 px-4 sm:px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-gray-800 capitalize">
              {role} Workspace
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to={role === 'patient' ? '/patient/notifications' : role === 'doctor' ? '/doctor/notifications' : '/admin/dashboard'}
              className="relative p-2 rounded-xl text-gray-600 hover:text-primary hover:bg-blue-50 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="text-right">
                <p className="text-xs font-bold text-gray-800 leading-tight">{user?.full_name}</p>
                <p className="text-[10px] text-gray-400 capitalize">{user?.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
