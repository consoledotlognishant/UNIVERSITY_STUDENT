import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  CalendarCheck,
  FileCheck2,
  FileBarChart2,
  ArrowUpRight,
  Plus,
  Eye,
  Search,
  Filter,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Award,
  IdCard,
  BellRing,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { StorageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { NavItemKey } from '../common/Sidebar';
import { Notice, Student, Faculty, User } from '../../types';
import { StatusBadge } from '../common/Badge';

interface AdminDashboardProps {
  onNavigate: (tab: NavItemKey) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [coursesCount, setCoursesCount] = useState(0);
  const [subjectsCount, setSubjectsCount] = useState(0);
  const [notices, setNotices] = useState<Notice[]>([]);

  // Registered records table filter & search
  const [recordSearch, setRecordSearch] = useState('');
  const [recordRoleFilter, setRecordRoleFilter] = useState<'all' | 'student' | 'faculty'>('all');

  // Inspection Modals
  const [inspectingStudent, setInspectingStudent] = useState<Student | null>(null);
  const [inspectingFaculty, setInspectingFaculty] = useState<Faculty | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setStudents(StorageService.getStudents());
    setFaculty(StorageService.getFaculty());
    setUsers(StorageService.getUsers());
    setCoursesCount(StorageService.getCourses().length);
    setSubjectsCount(StorageService.getSubjects().length);
    setNotices(StorageService.getNotices());
  };

  const totalStudents = students.length;
  const totalFaculty = faculty.length;
  const avgAttendance =
    totalStudents > 0
      ? Math.round(
          (students.reduce((acc, s) => acc + s.attendancePercentage, 0) / totalStudents) * 10
        ) / 10
      : 84.5;

  const lowAttendanceCount = students.filter((s) => s.attendancePercentage < 75).length;

  // Chart data: Attendance by Subject
  const attendanceData = [
    { subject: 'Data Structures', attendance: 88, threshold: 75 },
    { subject: 'DBMS', attendance: 83, threshold: 75 },
    { subject: 'Software Engg', attendance: 78, threshold: 75 },
    { subject: 'Operating Sys', attendance: 82, threshold: 75 },
    { subject: 'Computer Net.', attendance: 85, threshold: 75 },
  ];

  // Chart data: Performance Grade Distribution
  const gradeDistribution = [
    { name: 'O (Outstanding)', count: 2, color: '#1d4ed8' },
    { name: 'A+ (Excellent)', count: 3, color: '#2563eb' },
    { name: 'A (Very Good)', count: 2, color: '#3b82f6' },
    { name: 'B+ (Good)', count: 1, color: '#60a5fa' },
    { name: 'B / Below', count: 1, color: '#cbd5e1' },
  ];

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Consolidated list of all registered students & faculty for the admin
  const combinedEnrolledRecords = useMemo(() => {
    const studentItems = students.map((s) => ({
      id: s.id,
      name: s.name,
      identifier: s.rollNumber,
      secondaryId: s.studentId,
      role: 'student' as const,
      email: s.email,
      phone: s.phone,
      department: s.departmentName,
      program: s.courseName,
      stats: `Sem ${s.currentSemester} · GPA ${s.cgpa.toFixed(2)} · ${s.attendancePercentage}% Att`,
      status: s.status,
      registeredAt: s.registeredAt,
      rawStudent: s,
    }));

    const facultyItems = faculty.map((f) => ({
      id: f.id,
      name: f.name,
      identifier: f.facultyId,
      secondaryId: f.designation,
      role: 'faculty' as const,
      email: f.email,
      phone: f.phone,
      department: f.departmentName,
      program: f.qualification,
      stats: `${f.designation} · ${f.assignedSubjectIds.length} Subjects Assigned`,
      status: f.status,
      registeredAt: f.registeredAt,
      rawFaculty: f,
    }));

    let all = [...studentItems, ...facultyItems];

    if (recordRoleFilter !== 'all') {
      all = all.filter((item) => item.role === recordRoleFilter);
    }

    if (recordSearch.trim()) {
      const q = recordSearch.toLowerCase().trim();
      all = all.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.identifier.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q)
      );
    }

    return all;
  }, [students, faculty, recordRoleFilter, recordSearch]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white rounded-xl border border-slate-200 shadow-2xs gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
            <span>Academic Session 2026–2027</span>
            <span aria-hidden="true">·</span>
            <span>Autumn Term (Odd Semester)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Welcome, {user?.name || 'Department Administrator'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {user?.designation || 'Head of Department'} · {user?.departmentName || 'Computer Science & Engineering'} · Department Control Console
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block font-medium">System Timestamp</span>
            <span className="text-xs font-semibold text-slate-700 font-mono tabular-nums">
              {currentDateFormatted}
            </span>
          </div>
          <button
            onClick={() => onNavigate('attendance')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Mark Daily Attendance</span>
          </button>
        </div>
      </div>

      {/* Quick Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Students */}
        <div
          onClick={() => onNavigate('students')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {totalStudents}
            </span>
            <span className="text-xs text-emerald-600 font-medium flex items-center">
              Active Roster
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>B.Tech & M.Tech</span>
            <span className="text-blue-600 font-medium group-hover:underline">View All →</span>
          </div>
        </div>

        {/* Card 2: Faculty */}
        <div
          onClick={() => onNavigate('faculty')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Faculty
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {totalFaculty}
            </span>
            <span className="text-xs text-slate-500 font-medium">Professors & Instructors</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Teaching Workload</span>
            <span className="text-blue-600 font-medium group-hover:underline">Directory →</span>
          </div>
        </div>

        {/* Card 3: Attendance Average */}
        <div
          onClick={() => onNavigate('attendance')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Attendance
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {avgAttendance}%
            </span>
            <span className="text-xs text-slate-500 font-medium">Req. &ge; 75%</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between">
            <span className="text-rose-600 font-medium">{lowAttendanceCount} below threshold</span>
            <span className="text-blue-600 font-medium group-hover:underline">Audit →</span>
          </div>
        </div>

        {/* Card 4: Curricula & Courses */}
        <div
          onClick={() => onNavigate('courses')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Curriculum Units
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {subjectsCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">Subjects in {coursesCount} Courses</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Semester 1–8</span>
            <span className="text-blue-600 font-medium group-hover:underline">Catalog →</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRIMARY FEATURE: REGISTERED STUDENTS & FACULTY RECORDS (ADMIN ACCESS)      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header & Filter Controls */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <IdCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Enrolled & Registered Student & Faculty Records
                </h3>
                <p className="text-xs text-slate-500">
                  Live institutional records of registered students and faculty members. Click any record to inspect complete academic dossiers.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setRecordRoleFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  recordRoleFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({students.length + faculty.length})
              </button>
              <button
                type="button"
                onClick={() => setRecordRoleFilter('student')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  recordRoleFilter === 'student'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Students ({students.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setRecordRoleFilter('faculty')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  recordRoleFilter === 'faculty'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Faculty ({faculty.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={recordSearch}
                onChange={(e) => setRecordSearch(e.target.value)}
                placeholder="Search by name, roll no, or ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Member Name & ID</th>
                <th className="py-3 px-4">Role / Category</th>
                <th className="py-3 px-4">Department & Program</th>
                <th className="py-3 px-4">Institutional Contact</th>
                <th className="py-3 px-4">Academic Metrics / Workload</th>
                <th className="py-3 px-4">Registration Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {combinedEnrolledRecords.length > 0 ? (
                combinedEnrolledRecords.map((item) => (
                  <tr key={`${item.role}-${item.id}`} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name & ID */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white ${
                            item.role === 'student' ? 'bg-blue-700' : 'bg-emerald-700'
                          }`}
                        >
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block leading-tight">
                            {item.name}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 block">
                            {item.identifier}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role / Category */}
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm inline-flex items-center gap-1 ${
                          item.role === 'student'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {item.role === 'student' ? (
                          <GraduationCap className="w-3 h-3" />
                        ) : (
                          <Users className="w-3 h-3" />
                        )}
                        <span>{item.role === 'student' ? 'Student' : 'Faculty'}</span>
                      </span>
                    </td>

                    {/* Department & Program */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 block">{item.department}</span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[200px]">
                        {item.program}
                      </span>
                    </td>

                    {/* Contact Details */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span className="text-slate-800 block truncate max-w-[190px]">{item.email}</span>
                      <span className="text-slate-400 block">{item.phone}</span>
                    </td>

                    {/* Academic Stats */}
                    <td className="py-3 px-4">
                      <span className="text-slate-700 font-medium block">{item.stats}</span>
                    </td>

                    {/* Status & Online Registration */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={item.status} />
                        {item.registeredAt ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-sm">
                            Online Reg.
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Enrolled</span>
                        )}
                      </div>
                      {item.registeredAt && (
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                          {new Date(item.registeredAt).toLocaleDateString()}
                        </span>
                      )}
                    </td>

                    {/* Action: Inspect Record */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (item.role === 'student' && item.rawStudent) {
                            setInspectingStudent(item.rawStudent);
                          } else if (item.role === 'faculty' && item.rawFaculty) {
                            setInspectingFaculty(item.rawFaculty);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title="Inspect full academic records"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Record</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-500">
                    No enrolled records found matching &quot;{recordSearch}&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Shortcut Links */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <span>
            Displaying {combinedEnrolledRecords.length} enrolled records ({students.length} students, {faculty.length} faculty members)
          </span>
          <div className="flex items-center gap-3 font-semibold text-blue-700">
            <button
              onClick={() => onNavigate('students')}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              Open Full Students Directory <ArrowRight className="w-3 h-3" />
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => onNavigate('faculty')}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              Open Faculty Directory <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Attendance Overview by Subject (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Attendance Statistics by Subject</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current semester average attendance vs. 75% statutory eligibility line
              </p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              Detailed Log <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  domain={[50, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  unit="%"
                />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Average Attendance']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                  itemStyle={{ color: '#93c5fd' }}
                />
                <Bar dataKey="attendance" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Academic Performance Distribution (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Grade Distribution</h3>
              <span className="text-xs text-slate-500">Internal Exam</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Performance breakdown across 5th semester evaluations
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} Students`, name]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {gradeDistribution.map((g) => (
              <div key={g.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                  <span className="text-slate-600">{g.name}</span>
                </div>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {g.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Department Bulletins & Administrative Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Bulletins (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Active Department Circulars</h3>
            </div>
            <button
              onClick={() => onNavigate('notices')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Manage Notices →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {notices.slice(0, 3).map((notice) => (
              <div key={notice.id} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  {notice.priority === 'urgent' && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-sm border border-rose-200">
                      URGENT
                    </span>
                  )}
                  {notice.priority === 'high' && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                      HIGH
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-mono tabular-nums">{notice.postedDate}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500 truncate">{notice.postedBy}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                  {notice.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                  {notice.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Administrative Shortcuts (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Administrative Shortcuts</h3>
            <p className="text-xs text-slate-500 mb-4">
              Frequent departmental procedures for this academic term
            </p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('students')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-900 group-hover:text-blue-700">
                      Manage All Students
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      Enrollments, semester progression & records
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>

              <button
                onClick={() => onNavigate('faculty')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-900 group-hover:text-emerald-700">
                      Faculty & Workload Directory
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      Teaching assignments and instructor profiles
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button
                onClick={() => onNavigate('users')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-900 group-hover:text-purple-700">
                      User Accounts & Security Access
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      Portal credentials and account activations
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
              </button>

              <button
                onClick={() => onNavigate('reports')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <FileBarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-900 group-hover:text-amber-700">
                      Accreditation & Audit Reports
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      Export statistical academic compliance reports
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: COMPLETE STUDENT ACADEMIC DOSSIER INSPECTION                      */}
      {/* ========================================================================= */}
      {inspectingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {inspectingStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {inspectingStudent.name}
                  </h3>
                  <span className="text-xs text-slate-300 font-mono">
                    Roll No: {inspectingStudent.rollNumber} · {inspectingStudent.courseName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Key Academic Metrics */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">CGPA</span>
                  <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">
                    {inspectingStudent.cgpa.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500">out of 10.0</span>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Attendance</span>
                  <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">
                    {inspectingStudent.attendancePercentage}%
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">Eligible</span>
                </div>
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 block">Semester</span>
                  <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">
                    {inspectingStudent.currentSemester}
                  </span>
                  <span className="text-[10px] text-slate-500">Odd Term</span>
                </div>
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">Status</span>
                  <div className="mt-1.5">
                    <StatusBadge status={inspectingStudent.status} />
                  </div>
                </div>
              </div>

              {/* Enrollment & Degree Info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-1.5 text-xs">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Program & Department Enrollment</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Department</span>
                    <span className="font-semibold text-slate-800">{inspectingStudent.departmentName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Degree Program</span>
                    <span className="font-semibold text-slate-800">{inspectingStudent.courseName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Official Student ID</span>
                    <span className="font-mono font-semibold text-slate-800">{inspectingStudent.studentId}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Enrollment Batch Year</span>
                    <span className="font-semibold text-slate-800">{inspectingStudent.enrollmentYear}</span>
                  </div>
                </div>
              </div>

              {/* Personal & Contact Details */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-1.5 text-xs">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Institutional Contact & Personal Info</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-500 block">University Email</span>
                    <span className="font-mono text-slate-800">{inspectingStudent.email}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Contact Telephone</span>
                    <span className="font-mono text-slate-800">{inspectingStudent.phone}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Date of Birth / Blood Group</span>
                    <span className="text-slate-800">
                      {inspectingStudent.dateOfBirth} · {inspectingStudent.bloodGroup || 'O+'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Residential Address</span>
                    <span className="text-slate-800">{inspectingStudent.address}</span>
                  </div>
                </div>
              </div>

              {/* Parent & Emergency Info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-1.5 text-xs">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Guardian & Emergency Contact</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Guardian Full Name</span>
                    <span className="font-semibold text-slate-800">{inspectingStudent.guardianName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Guardian Phone</span>
                    <span className="font-mono text-slate-800">{inspectingStudent.guardianPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {inspectingStudent.registeredAt
                  ? `Registered online: ${new Date(inspectingStudent.registeredAt).toLocaleString()}`
                  : 'Enrolled via Department Admissions'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInspectingStudent(null);
                    onNavigate('students');
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  View in Full Students Directory →
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingStudent(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: COMPLETE FACULTY DOSSIER INSPECTION                               */}
      {/* ========================================================================= */}
      {inspectingFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  {inspectingFaculty.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {inspectingFaculty.name}
                  </h3>
                  <span className="text-xs text-slate-300 font-mono">
                    ID: {inspectingFaculty.facultyId} · {inspectingFaculty.designation}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingFaculty(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Designation</span>
                  <span className="text-sm font-bold text-slate-900 mt-1 block">
                    {inspectingFaculty.designation}
                  </span>
                </div>
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">Teaching Workload</span>
                  <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">
                    {inspectingFaculty.assignedSubjectIds.length}
                  </span>
                  <span className="text-[10px] text-slate-500">Subjects Assigned</span>
                </div>
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">Appointment</span>
                  <div className="mt-1.5">
                    <StatusBadge status={inspectingFaculty.status} />
                  </div>
                </div>
              </div>

              {/* Department & Qualifications */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-1.5 text-xs">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Academic Qualifications & Specialization</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Department</span>
                    <span className="font-semibold text-slate-800">{inspectingFaculty.departmentName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Joining Date</span>
                    <span className="font-semibold text-slate-800">{inspectingFaculty.joiningDate}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[11px] text-slate-500 block">Highest Degree / Qualifications</span>
                    <span className="font-semibold text-slate-800">{inspectingFaculty.qualification}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[11px] text-slate-500 block">Research Specialization</span>
                    <span className="text-slate-800">{inspectingFaculty.specialization || 'Computing Systems & Algorithms'}</span>
                  </div>
                </div>
              </div>

              {/* Contact & Office Room */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-1.5 text-xs">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Office Room & Institutional Contacts</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Official Email</span>
                    <span className="font-mono text-slate-800">{inspectingFaculty.email}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Contact Phone</span>
                    <span className="font-mono text-slate-800">{inspectingFaculty.phone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[11px] text-slate-500 block">Office Room / Cabin</span>
                    <span className="font-semibold text-slate-800">{inspectingFaculty.officeRoom}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {inspectingFaculty.registeredAt
                  ? `Registered online: ${new Date(inspectingFaculty.registeredAt).toLocaleString()}`
                  : 'Appointed via Faculty Affairs Office'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInspectingFaculty(null);
                    onNavigate('faculty');
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  View in Faculty Directory →
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingFaculty(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
