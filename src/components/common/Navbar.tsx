import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  CheckCircle2,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Building2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavItemKey } from './Sidebar';
import { StorageService } from '../../services/storageService';
import { Notice } from '../../types';
import { CGULogo } from './CGULogo';

interface NavbarProps {
  currentTab: NavItemKey;
  onOpenMobileMenu: () => void;
  onSelectTab: (tab: NavItemKey) => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenMobileMenu,
  onSelectTab,
}) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notices, setNotices] = useState<Notice[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotices(StorageService.getNotices().slice(0, 4));
  }, [currentTab]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumb = (key: NavItemKey) => {
    const map: Record<NavItemKey, { title: string; subtitle: string }> = {
      dashboard: { title: 'Dashboard Overview', subtitle: 'Academic & Administrative Summary' },
      students: { title: 'Student Management', subtitle: 'Enrollment & Academic Records' },
      faculty: { title: 'Faculty & Instructors', subtitle: 'Department Staff & Teaching Directory' },
      departments: { title: 'Departments', subtitle: 'Academic Divisions & Centers' },
      courses: { title: 'Courses Catalog', subtitle: 'Degree Programs & Curricula' },
      subjects: { title: 'Subjects & Modules', subtitle: 'Curriculum Subjects & Faculty Allocation' },
      'my-subjects': { title: 'Assigned Subjects', subtitle: 'Teaching Syllabus & Enrolled Classes' },
      attendance: { title: 'Attendance Management', subtitle: 'Daily Roll Call & Attendance Audits' },
      marks: { title: 'Marks & Results', subtitle: 'Internal, Sessional & Semester Grades' },
      timetable: { title: 'Weekly Timetable', subtitle: 'Class Schedules & Lecture Halls' },
      notices: { title: 'Notice Board', subtitle: 'Department Circulars & Bulletins' },
      reports: { title: 'Analytical Reports', subtitle: 'Exportable Academic & Institutional Data' },
      users: { title: 'User & Role Management', subtitle: 'Access Control & Security Accounts' },
      settings: { title: 'System Settings', subtitle: 'Department Configuration & Rules' },
      profile: { title: 'User Profile', subtitle: 'Personal Credentials & Information' },
    };
    return map[key] || { title: 'Portal', subtitle: 'University Information System' };
  };

  const breadcrumb = getBreadcrumb(currentTab);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white border-b border-slate-200 shadow-2xs">
      {/* Zone 1: Mobile Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-slate-500 rounded-lg hover:bg-slate-100 md:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <CGULogo className="w-8 h-8 md:hidden" />

        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="hover:text-slate-800 transition-colors">UDIS</span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span className="text-slate-700 capitalize">{user?.departmentName || 'Engineering'}</span>
          </nav>
          <h1 className="text-base font-semibold text-slate-900 tracking-tight leading-tight">
            {breadcrumb.title}
          </h1>
        </div>
      </div>

      {/* Zone 2: Search & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Institutional Role Tag */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-semibold text-slate-700 capitalize">
            {user?.role === 'admin' ? 'HOD / Admin' : user?.role || 'User'}
          </span>
          <span className="text-[10px] text-slate-400">·</span>
          <span className="text-[11px] text-slate-500 font-mono">
            {user?.username}
          </span>
        </div>

        {/* Search Input (Global quick filter) */}
        <div className="relative hidden sm:block w-44 md:w-60">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Notifications & Circulars"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Recent Department Notices
                </span>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onSelectTab('notices');
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View All <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setShowNotifications(false);
                      onSelectTab('notices');
                    }}
                    className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      {n.priority === 'urgent' ? (
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">{n.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{n.content}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {n.postedDate} · {n.postedBy}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="User profile options"
          >
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-semibold text-xs flex items-center justify-center border border-blue-700 shadow-2xs">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <span className="block text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                {user?.name || 'User'}
              </span>
              <span className="block text-[11px] text-slate-500 capitalize">
                {user?.role === 'admin' ? 'HOD / Admin' : user?.role || 'Portal'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-600">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{user?.departmentName}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onSelectTab('profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>My Profile Details</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
