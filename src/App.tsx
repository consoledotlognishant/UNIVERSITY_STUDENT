import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { LandingPage } from './components/landing/LandingPage';
import { Sidebar, NavItemKey } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';

// Dashboard components
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { FacultyDashboard } from './components/dashboard/FacultyDashboard';
import { StudentDashboard } from './components/dashboard/StudentDashboard';

// Module components
import { StudentsView } from './components/students/StudentsView';
import { FacultyView } from './components/faculty/FacultyView';
import { DepartmentsView } from './components/departments/DepartmentsView';
import { CoursesSubjectsView } from './components/academics/CoursesSubjectsView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { MarksView } from './components/marks/MarksView';
import { TimetableView } from './components/timetable/TimetableView';
import { NoticesView } from './components/notices/NoticesView';
import { ReportsView } from './components/reports/ReportsView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { ProfileView } from './components/profile/ProfileView';

const MainLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { warning } = useToast();
  const [currentTab, setCurrentTab] = useState<NavItemKey>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = user?.role || 'student';

  // Role-based protection: guard unauthorized tabs
  useEffect(() => {
    if (role === 'student') {
      const allowedStudentTabs: NavItemKey[] = [
        'dashboard',
        'profile',
        'my-subjects',
        'attendance',
        'marks',
        'timetable',
        'notices',
      ];
      if (!allowedStudentTabs.includes(currentTab)) {
        setCurrentTab('dashboard');
        warning('Access restricted: That module is reserved for faculty and administration.');
      }
    } else if (role === 'faculty') {
      const allowedFacultyTabs: NavItemKey[] = [
        'dashboard',
        'profile',
        'my-subjects',
        'attendance',
        'marks',
        'students',
        'notices',
      ];
      if (!allowedFacultyTabs.includes(currentTab)) {
        setCurrentTab('dashboard');
        warning('Access restricted: That module is reserved for departmental administration.');
      }
    }
  }, [role, currentTab, warning]);

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        if (role === 'admin') return <AdminDashboard onNavigate={setCurrentTab} />;
        if (role === 'faculty') return <FacultyDashboard onNavigate={setCurrentTab} />;
        return <StudentDashboard onNavigate={setCurrentTab} />;

      case 'students':
        return <StudentsView />;

      case 'faculty':
        return <FacultyView />;

      case 'departments':
        return <DepartmentsView />;

      case 'courses':
        return <CoursesSubjectsView initialTab="courses" />;

      case 'subjects':
      case 'my-subjects':
        return <CoursesSubjectsView initialTab="subjects" />;

      case 'attendance':
        return <AttendanceView />;

      case 'marks':
        return <MarksView />;

      case 'timetable':
        return <TimetableView />;

      case 'notices':
        return <NoticesView />;

      case 'reports':
        return <ReportsView />;

      case 'users':
        return <UsersView />;

      case 'settings':
        return <SettingsView />;

      case 'profile':
        return <ProfileView />;

      default:
        return <AdminDashboard onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Role-governed Collapsible Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <Navbar
          currentTab={currentTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onSelectTab={setCurrentTab}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ToastProvider>
  );
}
