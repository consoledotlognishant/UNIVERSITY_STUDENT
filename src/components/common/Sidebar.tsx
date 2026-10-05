import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarCheck,
  FileCheck2,
  BellRing,
  FileBarChart2,
  ShieldCheck,
  Settings,
  CalendarDays,
  UserCircle2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookMarked,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CGULogo } from './CGULogo';

export type NavItemKey =
  | 'dashboard'
  | 'students'
  | 'faculty'
  | 'departments'
  | 'courses'
  | 'subjects'
  | 'my-subjects'
  | 'attendance'
  | 'marks'
  | 'timetable'
  | 'notices'
  | 'reports'
  | 'users'
  | 'settings'
  | 'profile';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'student';

  const adminNav = [
    { key: 'dashboard' as NavItemKey, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'students' as NavItemKey, label: 'Students', icon: GraduationCap },
    { key: 'faculty' as NavItemKey, label: 'Faculty', icon: Users },
    { key: 'departments' as NavItemKey, label: 'Departments', icon: Building2 },
    { key: 'courses' as NavItemKey, label: 'Courses', icon: BookOpen },
    { key: 'subjects' as NavItemKey, label: 'Subjects', icon: BookMarked },
    { key: 'attendance' as NavItemKey, label: 'Attendance', icon: CalendarCheck },
    { key: 'marks' as NavItemKey, label: 'Marks & Results', icon: FileCheck2 },
    { key: 'notices' as NavItemKey, label: 'Notices', icon: BellRing },
    { key: 'reports' as NavItemKey, label: 'Reports', icon: FileBarChart2 },
    { key: 'users' as NavItemKey, label: 'User & Role Mgmt', icon: ShieldCheck },
    { key: 'settings' as NavItemKey, label: 'Settings', icon: Settings },
  ];

  const facultyNav = [
    { key: 'dashboard' as NavItemKey, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'profile' as NavItemKey, label: 'My Profile', icon: UserCircle2 },
    { key: 'my-subjects' as NavItemKey, label: 'My Subjects', icon: BookOpen },
    { key: 'attendance' as NavItemKey, label: 'Attendance', icon: CalendarCheck },
    { key: 'marks' as NavItemKey, label: 'Marks & Results', icon: FileCheck2 },
    { key: 'students' as NavItemKey, label: 'Student Records', icon: GraduationCap },
    { key: 'notices' as NavItemKey, label: 'Notices', icon: BellRing },
  ];

  const studentNav = [
    { key: 'dashboard' as NavItemKey, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'profile' as NavItemKey, label: 'My Profile', icon: UserCircle2 },
    { key: 'my-subjects' as NavItemKey, label: 'My Subjects', icon: BookOpen },
    { key: 'attendance' as NavItemKey, label: 'Attendance', icon: CalendarCheck },
    { key: 'marks' as NavItemKey, label: 'Marks & Results', icon: FileCheck2 },
    { key: 'timetable' as NavItemKey, label: 'Timetable', icon: CalendarDays },
    { key: 'notices' as NavItemKey, label: 'Notices', icon: BellRing },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'faculty' ? facultyNav : studentNav;

  const roleBadgeText =
    role === 'admin' ? 'Admin / HOD' : role === 'faculty' ? 'Faculty / Instructor' : 'Student';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out border-r border-slate-800 ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <CGULogo className="w-10 h-10" />
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="text-base font-bold tracking-tight text-white block truncate">
                  UDIS
                </span>
                <span className="text-xs text-slate-400 block truncate">C. V. Raman Global Univ.</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex items-center justify-center w-7 h-7 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Context Banner */}
        <div
          className={`py-3 px-4 border-b border-slate-800/80 bg-slate-950/40 shrink-0 ${
            isCollapsed ? 'text-center' : ''
          }`}
        >
          {isCollapsed ? (
            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-semibold text-xs flex items-center justify-center mx-auto border border-blue-500/30">
              {role.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {roleBadgeText}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">{user?.name || 'Authorized User'}</p>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelectTab(item.key);
                  onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer / Profile & Logout */}
        <div className="p-3 border-t border-slate-800 shrink-0 bg-slate-950/30">
          <button
            onClick={() => {
              onSelectTab('profile');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="My Profile"
          >
            <UserCircle2 className="w-5 h-5 shrink-0 text-slate-400" />
            {!isCollapsed && <span className="truncate">User Profile</span>}
          </button>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 shrink-0 text-rose-400" />
            {!isCollapsed && <span className="truncate">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
