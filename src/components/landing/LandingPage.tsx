import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck,
  FileCheck2,
  BellRing,
  FileBarChart2,
  ArrowRight,
  BookOpen,
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  UserPlus,
  LogIn,
  AlertCircle,
  KeyRound,
  IdCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CGULogo, cguLogoImg } from '../common/CGULogo';
import campusHero from '../../assets/images/university_campus_hero_1791001906396.jpg';
import { StorageService } from '../../services/storageService';
import { Role, Department, Course, Student, Faculty, User } from '../../types';

export const LandingPage: React.FC = () => {
  const { login, register } = useAuth();
  const { success, error, warning } = useToast();

  const [viewMode, setViewMode] = useState<'landing' | 'login' | 'register'>('landing');
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Sign In Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signInErrorState, setSignInErrorState] = useState<string | null>(null);

  // Registration Form States
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regRole, setRegRole] = useState<Role>('student');
  const [regDeptId, setRegDeptId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPhone, setRegPhone] = useState('');
  // Student-specific registration states
  const [regRollNumber, setRegRollNumber] = useState('');
  const [regCourseId, setRegCourseId] = useState('');
  const [regSemester, setRegSemester] = useState(1);
  // Faculty-specific registration states
  const [regFacultyId, setRegFacultyId] = useState('');
  const [regDesignation, setRegDesignation] = useState<'Professor & HOD' | 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer'>('Assistant Professor');
  const [regSpecialization, setRegSpecialization] = useState('');

  // Password reset modal states
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Real data lists from storage for dynamic metrics
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Navigation section active tracking
  type NavSection = 'overview' | 'features' | 'roles' | 'departments' | 'security';
  const [activeSection, setActiveSection] = useState<NavSection>('overview');

  const handleNavClick = (section: NavSection) => {
    setActiveSection(section);
    if (viewMode !== 'landing') {
      setViewMode('landing');
    }
    setTimeout(() => {
      if (section === 'overview') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.getElementById(section);
      if (el) {
        const headerOffset = 70;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 60);
  };

  // Scroll listener to update active blue indicator as user scrolls
  useEffect(() => {
    if (viewMode !== 'landing') return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      const sections: { id: NavSection; el: HTMLElement | null }[] = [
        { id: 'security', el: document.getElementById('security') },
        { id: 'departments', el: document.getElementById('departments') },
        { id: 'roles', el: document.getElementById('roles') },
        { id: 'features', el: document.getElementById('features') },
        { id: 'overview', el: document.getElementById('overview') },
      ];

      for (const sec of sections) {
        if (sec.el && scrollPosition >= sec.el.offsetTop) {
          setActiveSection(sec.id);
          return;
        }
      }
      setActiveSection('overview');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [viewMode]);

  useEffect(() => {
    const depts = StorageService.getDepartments();
    const crs = StorageService.getCourses();
    const stus = StorageService.getStudents();
    const facs = StorageService.getFaculty();
    const usrs = StorageService.getUsers();

    setDepartments(depts);
    setCourses(crs);
    setStudents(stus);
    setFaculty(facs);
    setUsers(usrs);

    if (depts.length > 0 && !regDeptId) {
      setRegDeptId(depts[0].id);
    }
    if (crs.length > 0 && !regCourseId) {
      setRegCourseId(crs[0].id);
    }
  }, [viewMode, authMode]);

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInErrorState(null);

    if (!username.trim()) {
      error('Please enter your registered username or university email.');
      return;
    }
    if (!password) {
      error('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = login(username, password);
      setIsSubmitting(false);

      if (res.success) {
        success('Authentication verified. Welcome to your departmental dashboard.', 'Access Granted');
      } else {
        if (res.errorType === 'NOT_REGISTERED') {
          setSignInErrorState(res.message || 'No registered account found. You must register first.');
          error(res.message || 'Account not registered. Please register first.');
        } else if (res.errorType === 'INVALID_PASSWORD') {
          setSignInErrorState('Invalid password. Please check your credentials.');
          error('Invalid password. Please verify and try again.');
        } else {
          setSignInErrorState(res.message || 'Authentication error.');
          error(res.message || 'Authentication failed.');
        }
      }
    }, 350);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!regFullName.trim()) {
      error('Please provide your full legal name.');
      return;
    }
    if (!regEmail.trim()) {
      error('Please enter your university or institutional email.');
      return;
    }
    if (!regUsername.trim()) {
      error('Please provide a unique username.');
      return;
    }
    if (regPassword.length < 6) {
      error('Password must be at least 6 characters in length.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      error('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (regRole === 'student' && !regRollNumber.trim()) {
      error('Please provide your university student Roll Number.');
      return;
    }
    if (regRole === 'faculty' && !regFacultyId.trim()) {
      error('Please provide your Faculty Employee ID.');
      return;
    }

    const selectedDept = departments.find((d) => d.id === regDeptId) || departments[0];
    const selectedCourse = courses.find((c) => c.id === regCourseId) || courses[0];

    setIsSubmitting(true);
    setTimeout(() => {
      const res = register({
        username: regUsername.trim(),
        password: regPassword,
        name: regFullName.trim(),
        email: regEmail.trim(),
        role: regRole,
        departmentId: selectedDept?.id || 'dept-cse',
        departmentName: selectedDept?.name || 'Computer Science & Engineering',
        phone: regPhone.trim() || undefined,
        rollNumber: regRole === 'student' ? regRollNumber.trim() : undefined,
        courseId: regRole === 'student' ? selectedCourse?.id : undefined,
        courseName: regRole === 'student' ? selectedCourse?.name : undefined,
        currentSemester: regRole === 'student' ? Number(regSemester) : undefined,
        facultyId: regRole === 'faculty' ? regFacultyId.trim() : undefined,
        designation: regRole === 'faculty' ? regDesignation : undefined,
        specialization: regRole === 'faculty' ? regSpecialization.trim() : undefined,
      });

      setIsSubmitting(false);

      if (res.success) {
        success(
          `Account for ${regFullName.trim()} registered successfully. You may now sign in.`,
          'Registration Completed'
        );
        // Pre-fill username on sign in form
        setUsername(regUsername.trim());
        setPassword('');
        setSignInErrorState(null);
        setAuthMode('signin');
      } else {
        error(res.message || 'Failed to complete registration.');
      }
    }, 400);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      error('Please enter your university email address.');
      return;
    }
    setForgotPasswordOpen(false);
    success(
      `Password reset instructions have been dispatched to ${forgotEmail}. Please check your inbox.`,
      'Recovery Email Sent'
    );
    setForgotEmail('');
  };

  const navigateToRoleAuth = (role: Role, mode: 'signin' | 'register') => {
    setRegRole(role);
    setAuthMode(mode);
    setSignInErrorState(null);

    const el = document.getElementById('auth-section');
    if (viewMode === 'landing' && el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setViewMode(mode === 'register' ? 'register' : 'login');
    }
  };

  const renderAuthCard = () => (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-7 text-slate-900 overflow-hidden">
      {/* Subtle University Logo Watermark inside Auth Card */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
      >
        <img
          src={cguLogoImg}
          alt=""
          className="w-72 h-72 sm:w-80 sm:h-80 object-contain opacity-[0.05] transform scale-110"
        />
      </div>

      <div className="relative z-10">
        {/* Header Branding */}
        <div className="mb-5 flex items-center gap-3">
          <CGULogo className="w-11 h-11" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              UDIS Institutional Portal
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              C. V. Raman Global University · Official Access
            </p>
          </div>
        </div>

        {/* Primary Auth Mode Switcher Tabs: Sign In vs Register (Required First) */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setSignInErrorState(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'signin'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setSignInErrorState(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'register'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Account</span>
          </button>
        </div>

        {/* MODE 1: SIGN IN */}
        {authMode === 'signin' ? (
          <div>
            {signInErrorState && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-950">{signInErrorState}</p>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    Are you a new student or faculty member?
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRegUsername(username);
                      setAuthMode('register');
                      setSignInErrorState(null);
                    }}
                    className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-md text-[11px] transition-colors shadow-2xs"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Register this Account</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Registered Username or University Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. 2401020374 or ananya.s@cgu-odisha.ac.in"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                    required
                  />
                </div>
                <span className="block text-[11px] text-slate-500 mt-1">
                  You must be registered in the departmental database to sign in.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Account Password</label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your registered password"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600">Remember credentials on this browser</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-75 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? 'Verifying Registration...' : 'Sign In to Dashboard'}
              </button>
            </form>

            {/* Prompt to Register */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Don&apos;t have an active registration yet?
              </p>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setSignInErrorState(null);
                }}
                className="mt-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 hover:underline cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register as Student, Faculty, or Administrator</span>
              </button>
            </div>
          </div>
        ) : (
          /* MODE 2: REGISTRATION */
          <div>
            <div className="mb-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 block">
                Create Institutional Profile
              </span>
              <p className="text-[11px] text-slate-500">
                Register first to generate your verified academic profile and portal access.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Role Selection */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select User Category *
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRegRole('student')}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all text-center cursor-pointer ${
                      regRole === 'student'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('faculty')}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all text-center cursor-pointer ${
                      regRole === 'faculty'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Faculty
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('admin')}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all text-center cursor-pointer ${
                      regRole === 'admin'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Admin / HOD
                  </button>
                </div>
              </div>

              {/* Full Name & Institutional Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Ayush Kumar Das"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    University Email *
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="student@cgu-odisha.ac.in"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              {/* Username & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unique Username *
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. 2401020385 or adas"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Department *
                  </label>
                  <select
                    value={regDeptId}
                    onChange={(e) => setRegDeptId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Role-Specific Fields */}
              {regRole === 'student' && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-blue-900 font-semibold text-xs">
                    <GraduationCap className="w-4 h-4 text-blue-700" />
                    <span>Student Enrollment Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Roll Number *
                      </label>
                      <input
                        type="text"
                        value={regRollNumber}
                        onChange={(e) => setRegRollNumber(e.target.value)}
                        placeholder="e.g. 2401020385"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Degree Program
                      </label>
                      <select
                        value={regCourseId}
                        onChange={(e) => setRegCourseId(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Current Semester
                      </label>
                      <select
                        value={regSemester}
                        onChange={(e) => setRegSemester(Number(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {regRole === 'faculty' && (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-semibold text-xs">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span>Faculty Appointment Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Employee ID *
                      </label>
                      <input
                        type="text"
                        value={regFacultyId}
                        onChange={(e) => setRegFacultyId(e.target.value)}
                        placeholder="FAC-CSE-15"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Designation
                      </label>
                      <select
                        value={regDesignation}
                        onChange={(e) =>
                          setRegDesignation(
                            e.target.value as 'Professor & HOD' | 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer'
                          )
                        }
                        className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                      >
                        <option value="Professor & HOD">Professor & HOD</option>
                        <option value="Professor">Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Lecturer">Lecturer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={regSpecialization}
                        onChange={(e) => setRegSpecialization(e.target.value)}
                        placeholder="e.g. AI, Cyber Security"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password (min. 6 characters) *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-75 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Creating Registered Account...' : 'Complete Institutional Registration'}</span>
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-600">Already have a registered account? </span>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setSignInErrorState(null);
                }}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Sign In directly
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top University Brand Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CGULogo className="w-10 h-10" />
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                UDIS
              </span>
              <span className="text-xs text-slate-500 block leading-tight">
                C. V. Raman Global University · Department Portal
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-sm font-medium">
            <button
              type="button"
              onClick={() => handleNavClick('overview')}
              className={`transition-colors py-1 relative cursor-pointer ${
                viewMode === 'landing' && activeSection === 'overview'
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Overview
              {viewMode === 'landing' && activeSection === 'overview' && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('features')}
              className={`transition-colors py-1 relative cursor-pointer ${
                viewMode === 'landing' && activeSection === 'features'
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Modules
              {viewMode === 'landing' && activeSection === 'features' && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('roles')}
              className={`transition-colors py-1 relative cursor-pointer ${
                viewMode === 'landing' && activeSection === 'roles'
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Role Portals
              {viewMode === 'landing' && activeSection === 'roles' && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('departments')}
              className={`transition-colors py-1 relative cursor-pointer ${
                viewMode === 'landing' && activeSection === 'departments'
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Departments
              {viewMode === 'landing' && activeSection === 'departments' && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('security')}
              className={`transition-colors py-1 relative cursor-pointer ${
                viewMode === 'landing' && activeSection === 'security'
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Accreditation
              {viewMode === 'landing' && activeSection === 'security' && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setViewMode('landing');
                  handleNavClick('overview');
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === 'landing'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Portal Home
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  setAuthMode('signin');
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === 'login' && authMode === 'signin'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('register');
                  setAuthMode('register');
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === 'register' || (viewMode === 'login' && authMode === 'register')
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (viewMode === 'landing') {
                  const el = document.getElementById('auth-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setViewMode('login');
                  }
                } else {
                  setViewMode('landing');
                }
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap hidden sm:block cursor-pointer"
            >
              {viewMode === 'landing' ? 'Access Portal' : 'Explore UDIS'}
            </button>
          </div>
        </div>

        {/* Mobile quick navigation pill bar */}
        {viewMode === 'landing' && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 px-3 py-2 overflow-x-auto flex items-center gap-2 text-xs">
            {[
              { id: 'overview' as const, label: 'Overview' },
              { id: 'features' as const, label: 'Modules' },
              { id: 'roles' as const, label: 'Role Portals' },
              { id: 'departments' as const, label: 'Departments' },
              { id: 'security' as const, label: 'Accreditation' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* DEDICATED FULL-SCREEN LOGIN / REGISTRATION PAGE */}
      {viewMode === 'login' || viewMode === 'register' ? (
        <div className="relative flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-900 overflow-hidden">
          {/* Giant C. V. Raman Global University Logo Watermark in Background */}
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
          >
            <img
              src={cguLogoImg}
              alt="C. V. Raman Global University Watermark"
              className="w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] object-contain opacity-[0.09] filter invert brightness-125"
            />
          </div>

          <div className="relative z-10 w-full max-w-lg my-8">
            {renderAuthCard()}
          </div>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section id="overview" className="relative overflow-hidden bg-slate-900 text-white py-16 md:py-24">
            {/* Background photo overlay */}
            <div className="absolute inset-0 z-0 opacity-25">
              <img
                src={campusHero}
                alt="University Campus Quadrangle"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950/70" />
            </div>

            {/* University Logo Watermark behind Hero */}
            <div
              aria-hidden="true"
              className="absolute -right-16 top-1/2 -translate-y-1/2 w-[540px] h-[540px] pointer-events-none select-none opacity-[0.08] z-0 hidden lg:flex items-center justify-center overflow-hidden"
            >
              <img
                src={cguLogoImg}
                alt="C. V. Raman Global University Watermark"
                className="w-full h-full object-contain filter invert"
              />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Hero Left Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Next-Gen Academic ERP · NBA & NAAC Compliant</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  University Department <br />
                  <span className="text-blue-400">Information System</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                  One centralized platform for managing students, faculty, courses, attendance, results,
                  and department communication with strict role-governed verification and real institutional records.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => {
                      setAuthMode('signin');
                      setViewMode('login');
                    }}
                    className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    Sign In to Portal <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setViewMode('register');
                    }}
                    className="px-6 py-3 text-sm font-semibold text-blue-200 bg-slate-800 hover:bg-slate-700 border border-blue-500/40 rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-blue-400" />
                    Register Account
                  </button>
                </div>

                {/* Quick trust metrics from actual live records */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-left">
                  <div>
                    <span className="block text-2xl font-bold text-white font-mono tabular-nums">
                      {students.length}
                    </span>
                    <span className="text-xs text-slate-400">Enrolled Students</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold text-white font-mono tabular-nums">
                      {faculty.length}
                    </span>
                    <span className="text-xs text-slate-400">Faculty Members</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold text-white font-mono tabular-nums">
                      {users.length}
                    </span>
                    <span className="text-xs text-slate-400">Registered Accounts</span>
                  </div>
                </div>
              </div>

              {/* Hero Right: Interactive Auth Card (Sign In / Register) */}
              <div id="auth-section" className="lg:col-span-5">
                {renderAuthCard()}
              </div>
            </div>
          </section>

          {/* Forgot Password Modal */}
          {forgotPasswordOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in fade-in duration-150">
                <h4 className="text-base font-bold text-slate-900 mb-2">Reset Portal Password</h4>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Enter your registered university email ID. A secure one-time password recovery link will be
                  dispatched by the Department Systems Administrator.
                </p>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. 2401020374@cgu-odisha.ac.in"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    required
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-2xs cursor-pointer"
                    >
                      Send Recovery Link
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Feature Modules Overview Section */}
          <section id="features" className="py-20 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 block mb-2">
                  System Architecture & Core Modules
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Engineered for Complete Department Operations
                </h2>
                <p className="mt-3 text-sm text-slate-600">
                  The UDIS framework maps standard university academic protocols into an integrated digital workflow.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white transition-all">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">Student Information</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Comprehensive profile tracking with roll numbers, contact information, guardians, semester progression, cumulative GPA, and enrolled subjects.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white transition-all">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">Faculty Management</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Instructor directories, academic qualifications, research specializations, office hours, and subject teaching assignments.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white transition-all">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">Daily Attendance Audits</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Classroom roll-call verification by faculty with subject-wise percentages, automatic alerts for students under the mandatory 75% threshold.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white transition-all">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">Marks & Results Engine</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Evaluation tracking for Internal, Sessional, and External examinations with automatic 10-point letter grading and department transcripts.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white transition-all">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">Notice & Circular Board</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Targeted departmental bulletins for faculty, students, or entire departments with urgency tags, priority levels, and draft/publish workflows.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white transition-all">
                  <div className="w-10 h-10 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center mb-4">
                    <FileBarChart2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">Analytical Reports</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Exportable CSV and printable PDF summaries for department statistics, accreditation audits, attendance trends, and enrollment metrics.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Role-Based Experience Section */}
          <section id="roles" className="py-20 bg-slate-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 block mb-2">
                  Role-Based Access Control
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Dedicated Portals for Every Stakeholder
                </h2>
                <p className="mt-3 text-sm text-slate-600">
                  Register with your institutional credentials to access your designated departmental dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Admin Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md mb-4">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Admin / Head of Department</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">Executive Department Governance</h3>
                    <ul className="space-y-2 text-xs text-slate-600 mt-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Manage all Students, Faculty, Courses & Subjects</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Department-wide attendance & grade auditing</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Publish official notices & circulars</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Export institutional accreditation reports</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 flex flex-col gap-2">
                    <button
                      onClick={() => navigateToRoleAuth('admin', 'signin')}
                      className="w-full py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Sign In to Admin Portal →
                    </button>
                    <button
                      onClick={() => navigateToRoleAuth('admin', 'register')}
                      className="w-full py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Register Admin Account
                    </button>
                  </div>
                </div>

                {/* Faculty Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md mb-4">
                      <Users className="w-4 h-4" />
                      <span>Faculty / Instructor</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">Teaching & Evaluation Workspace</h3>
                    <ul className="space-y-2 text-xs text-slate-600 mt-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>View assigned subjects and class timetables</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Mark & update daily student attendance</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Enter marks for Internal, Sessional & End-Sem</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Access student rosters and performance graphs</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 flex flex-col gap-2">
                    <button
                      onClick={() => navigateToRoleAuth('faculty', 'signin')}
                      className="w-full py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Sign In to Faculty Portal →
                    </button>
                    <button
                      onClick={() => navigateToRoleAuth('faculty', 'register')}
                      className="w-full py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Register Faculty Account
                    </button>
                  </div>
                </div>

                {/* Student Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md mb-4">
                      <GraduationCap className="w-4 h-4" />
                      <span>Student Portal</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">Academic Dashboard & Records</h3>
                    <ul className="space-y-2 text-xs text-slate-600 mt-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Check overall & subject-wise attendance %</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Access semester grades, GPA & mark breakdown</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>View weekly class schedule & room allocations</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Receive urgent departmental bulletins</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 flex flex-col gap-2">
                    <button
                      onClick={() => navigateToRoleAuth('student', 'signin')}
                      className="w-full py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Sign In to Student Portal →
                    </button>
                    <button
                      onClick={() => navigateToRoleAuth('student', 'register')}
                      className="w-full py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Register Student Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Departments Section */}
          <section id="departments" className="py-20 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 block mb-2">
                  Academic Divisions
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Connected Departmental Infrastructure
                </h2>
                <p className="mt-3 text-sm text-slate-600">
                  UDIS powers interconnected academic branches with unified faculty and syllabus tracking.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {departments.map((dept, index) => {
                  const deptStudents = students.filter((s) => s.departmentId === dept.id).length;
                  const deptFaculty = faculty.filter((f) => f.departmentId === dept.id).length;
                  const deptCourses = courses.filter((c) => c.departmentId === dept.id).length;
                  const badgeColors = ['bg-blue-600', 'bg-indigo-600', 'bg-slate-700'];

                  return (
                    <div key={dept.id} className="p-6 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-9 h-9 rounded-lg ${badgeColors[index % badgeColors.length]} text-white flex items-center justify-center font-bold text-xs`}>
                            {dept.code}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{dept.name}</h4>
                            <span className="text-[11px] text-slate-500">
                              Established {dept.establishedYear} · HOD: {dept.hodName}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                          {dept.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200 font-mono">
                        <span>{deptStudents} Students</span>
                        <span>{deptFaculty} Faculty</span>
                        <span>{deptCourses || 1} {deptCourses === 1 ? 'Program' : 'Programs'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Institutional Footer */}
          <footer id="security" className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800 text-xs">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <CGULogo className="w-8 h-8" />
                    <div>
                      <span className="text-sm font-bold text-white block leading-tight">UDIS Portal</span>
                      <span className="text-[10px] text-slate-400 block leading-tight">C. V. Raman Global University</span>
                    </div>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    University Department Information System is an institutional platform for academic governance, attendance audits, and examination administration.
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold text-white uppercase tracking-wider mb-3">Portal Links</h5>
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => navigateToRoleAuth('admin', 'signin')}
                        className="hover:text-white transition-colors cursor-pointer text-left"
                      >
                        HOD & Admin Portal
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => navigateToRoleAuth('faculty', 'signin')}
                        className="hover:text-white transition-colors cursor-pointer text-left"
                      >
                        Faculty Workspace
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => navigateToRoleAuth('student', 'signin')}
                        className="hover:text-white transition-colors cursor-pointer text-left"
                      >
                        Student Academic Hub
                      </button>
                    </li>
                    <li>
                      <a href="#features" className="hover:text-white transition-colors">
                        Examination Regulations
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-white uppercase tracking-wider mb-3">Academic Guidelines</h5>
                  <ul className="space-y-2">
                    <li>
                      <span>Minimum 75% Attendance Requirement</span>
                    </li>
                    <li>
                      <span>10-Point Letter Grading Scheme (CBCS)</span>
                    </li>
                    <li>
                      <span>Continuous Internal Evaluation (CIE)</span>
                    </li>
                    <li>
                      <span>End-Semester Examination Rules</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-white uppercase tracking-wider mb-3">Support & IT Desk</h5>
                  <p className="text-slate-400 leading-relaxed mb-2">
                    For registration assistance or roll number verification, contact the Department Systems Coordinator.
                  </p>
                  <p className="text-slate-300 font-mono">sysadmin@cgu-odisha.ac.in</p>
                  <p className="text-slate-400 mt-1">Intercom: 4012 / Tech Block 3</p>
                </div>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
                <p>© {new Date().getFullYear()} University Department Information System (UDIS). All rights reserved.</p>
                <div className="flex items-center gap-6">
                  <span>Privacy Policy</span>
                  <span>Academic Integrity</span>
                  <span>Terms of Service</span>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};
