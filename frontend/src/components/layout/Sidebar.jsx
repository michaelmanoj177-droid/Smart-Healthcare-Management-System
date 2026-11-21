import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Users,
  Search,
  Calendar,
  FileText,
  Pill,
  Bot,
  Bell,
  Settings,
  ShieldCheck,
  Building2,
  ScrollText,
  LogOut,
  Clock,
  Activity,
  ChevronRight,
  Boxes,
  ShieldAlert,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, role, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nav menus per role
  const patientNav = [
    { label: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'Find Doctors', path: '/patient/find-doctors', icon: Search },
    { label: 'Book Appointment', path: '/patient/book-appointment', icon: Calendar },
    { label: 'My Appointments', path: '/patient/appointments', icon: Clock },
    { label: 'Medical Records', path: '/patient/records', icon: FileText },
    { label: 'Prescriptions', path: '/patient/prescriptions', icon: Pill },
    { label: 'My Medications', path: '/patient/my-medications', icon: Pill },
    { label: 'Daily Schedule', path: '/patient/medication-schedule', icon: Clock },
    { label: 'Dose Reminders', path: '/patient/medication-reminders', icon: Bell },
    { label: 'Safety Checker', path: '/patient/medication-safety', icon: ShieldAlert },
    { label: 'Medicine Info', path: '/medications/info', icon: Search },
    { label: 'AI Health Assistant', path: '/patient/ai-assistant', icon: Bot, highlight: true },
    { label: 'Notifications', path: '/patient/notifications', icon: Bell, badge: unreadCount },
    { label: 'My Profile', path: '/patient/profile', icon: User },
    { label: 'Account Settings', path: '/patient/settings', icon: Settings },
  ];

  const doctorNav = [
    { label: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { label: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { label: 'Patient Records', path: '/doctor/patients', icon: Users },
    { label: 'Create Record', path: '/doctor/create-record', icon: FileText },
    { label: 'Create Prescription', path: '/doctor/create-prescription', icon: Pill },
    { label: 'Pharmacy Inventory', path: '/pharmacy/inventory', icon: Boxes },
    { label: 'Stock & Expiry Alerts', path: '/pharmacy/alerts', icon: ShieldAlert },
    { label: 'Medicine Reference', path: '/medications/info', icon: Search },
    { label: 'Manage Availability', path: '/doctor/availability', icon: Clock },
    { label: 'Notifications', path: '/doctor/notifications', icon: Bell, badge: unreadCount },
    { label: 'Doctor Profile', path: '/doctor/profile', icon: User },
    { label: 'Account Settings', path: '/doctor/settings', icon: Settings },
  ];

  const adminNav = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Patient Management', path: '/admin/patients', icon: Users },
    { label: 'Doctor Management', path: '/admin/doctors', icon: User },
    { label: 'Doctor Verification', path: '/admin/verification', icon: ShieldCheck },
    { label: 'Appointment Center', path: '/admin/appointments', icon: Calendar },
    { label: 'Pharmacy Inventory', path: '/pharmacy/inventory', icon: Boxes },
    { label: 'Stock & Expiry Alerts', path: '/pharmacy/alerts', icon: ShieldAlert },
    { label: 'Medicine Reference', path: '/medications/info', icon: Search },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  const items = role === 'admin' ? adminNav : role === 'doctor' ? doctorNav : patientNav;

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 shadow-sm w-64 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight leading-none">Apex Medicare</h2>
          <span className="text-[10px] uppercase font-semibold text-primary tracking-wider">
            {role === 'admin' ? 'Admin Portal' : role === 'doctor' ? 'Physician Portal' : 'Patient Portal'}
          </span>
        </div>
      </div>

      {/* User profile compact badge */}
      <div className="p-4 mx-3 my-2 rounded-xl bg-surface border border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-primary font-bold flex items-center justify-center text-sm shrink-0">
          {user?.full_name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{user?.full_name}</p>
          <p className="text-[11px] text-gray-500 capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Navigation links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-primary font-semibold shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                } ${item.highlight ? 'border border-blue-100' : ''}`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-danger text-white">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Logout button */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-danger hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0 z-30">
        {content}
      </div>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative h-full w-64 max-w-[80vw]">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
