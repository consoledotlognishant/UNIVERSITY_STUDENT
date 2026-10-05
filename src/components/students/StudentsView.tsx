import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  X,
  CheckCircle2,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { Student, Department, Course } from '../../types';
import { StatusBadge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';

export const StudentsView: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const isAdmin = user?.role === 'admin';

  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'name' | 'rollNumber' | 'attendancePercentage' | 'cgpa'>('rollNumber');
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Form state
  const initialFormData: Omit<Student, 'id'> = {
    studentId: '',
    name: '',
    rollNumber: '',
    departmentId: 'dept-cse',
    departmentName: 'Computer Science & Engineering',
    courseId: 'course-btech-cse',
    courseName: 'B.Tech CSE',
    currentSemester: 5,
    email: '',
    phone: '',
    dateOfBirth: '2004-06-15',
    bloodGroup: 'O+',
    address: '',
    guardianName: '',
    guardianPhone: '',
    enrollmentYear: 2024,
    status: 'active',
    cgpa: 8.0,
    attendancePercentage: 85,
  };
  const [formData, setFormData] = useState<Omit<Student, 'id'>>(initialFormData);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStudents(StorageService.getStudents());
    setDepartments(StorageService.getDepartments());
    setCourses(StorageService.getCourses());
  };

  const handleSort = (field: 'name' | 'rollNumber' | 'attendancePercentage' | 'cgpa') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filtered & Sorted students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
          s.studentId.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase());

        const matchesDept = departmentFilter === 'all' || s.departmentId === departmentFilter;
        const matchesCourse = courseFilter === 'all' || s.courseId === courseFilter;
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

        return matchesSearch && matchesDept && matchesCourse && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          return sortAsc
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }
        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [students, search, departmentFilter, courseFilter, statusFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.rollNumber.trim()) {
      error('Student Name and Roll Number are required.');
      return;
    }
    const dept = departments.find((d) => d.id === formData.departmentId);
    const crs = courses.find((c) => c.id === formData.courseId);

    const payload = {
      ...formData,
      departmentName: dept?.name || 'Computer Science & Engineering',
      courseName: crs?.name || 'B.Tech CSE',
      studentId: formData.studentId || `STU${Date.now().toString().slice(-6)}`,
    };

    StorageService.addStudent(payload);
    loadData();
    setIsAddModalOpen(false);
    setFormData(initialFormData);
    success(`Student ${payload.name} (${payload.rollNumber}) successfully added.`, 'Record Created');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    StorageService.updateStudent(editingStudent);
    loadData();
    setIsEditModalOpen(false);
    setEditingStudent(null);
    success(`Student record for ${editingStudent.name} updated successfully.`, 'Changes Saved');
  };

  const handleDeleteConfirm = () => {
    if (!deletingStudent) return;
    StorageService.deleteStudent(deletingStudent.id);
    loadData();
    setDeletingStudent(null);
    success(`Student record ${deletingStudent.rollNumber} has been removed.`, 'Student Deleted');
  };

  const handleExportCSV = () => {
    const headers = ['Student ID,Name,Roll Number,Department,Course,Semester,Email,Phone,CGPA,Attendance %,Status'];
    const rows = filteredStudents.map(
      (s) =>
        `"${s.studentId}","${s.name}","${s.rollNumber}","${s.departmentName}","${s.courseName}",${s.currentSemester},"${s.email}","${s.phone}",${s.cgpa},${s.attendancePercentage},"${s.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UDIS_Students_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Student roster exported to CSV successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Student Management Roster</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student admissions, batch registrations, contact records, and academic status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setFormData({
                  ...initialFormData,
                  studentId: `STU${Date.now().toString().slice(-4)}`,
                  rollNumber: `2401020${Math.floor(380 + Math.random() * 50)}`,
                });
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, roll, or ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        {/* Course Filter */}
        <div>
          <select
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th
                  onClick={() => handleSort('rollNumber')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Roll Number / ID</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Student Name</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Program & Dept</th>
                <th className="py-3 px-4">Contact Details</th>
                <th
                  onClick={() => handleSort('attendancePercentage')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Attendance %</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cgpa')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>CGPA</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Roll & Student ID */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 block tabular-nums">
                          {s.rollNumber}
                        </span>
                        {s.registeredAt && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded-xs">
                            Online Reg
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 block tabular-nums">
                        {s.studentId}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{s.name}</span>
                      <span className="text-[11px] text-slate-500">Sem {s.currentSemester} · Batch {s.enrollmentYear}</span>
                    </td>

                    {/* Program & Dept */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 block truncate max-w-[150px]">
                        {s.courseName}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                        {s.departmentName}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4">
                      <span className="text-slate-600 block truncate max-w-[170px]">{s.email}</span>
                      <span className="text-slate-400 font-mono text-[11px] block">{s.phone}</span>
                    </td>

                    {/* Attendance % */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            s.attendancePercentage >= 75 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {s.attendancePercentage}%
                        </span>
                        {s.attendancePercentage < 75 && (
                          <span title="Under 75% threshold">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          </span>
                        )}
                      </div>
                      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            s.attendancePercentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(s.attendancePercentage, 100)}%` }}
                        />
                      </div>
                    </td>

                    {/* CGPA */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 tabular-nums">
                      {s.cgpa.toFixed(2)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={s.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingStudent(s)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => {
                                setEditingStudent(s);
                                setIsEditModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Edit Student"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingStudent(s)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">No student records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try clearing search queries or adjusting department/course filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 text-xs text-slate-500 bg-slate-50/50">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-700">
              {filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * pageSize, filteredStudents.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-700">{filteredStudents.length}</span> students
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-300 bg-white rounded-md text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-slate-600 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-slate-300 bg-white rounded-md text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Student Profile Modal / Drawer */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Student Academic Profile</h3>
                <span className="text-xs text-slate-500 font-mono">UDIS Record #{viewingStudent.studentId}</span>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-blue-900 text-white font-bold text-xl flex items-center justify-center shrink-0 border-2 border-blue-700">
                  {viewingStudent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{viewingStudent.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">
                    Roll No: {viewingStudent.rollNumber} · Enrolled {viewingStudent.enrollmentYear}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={viewingStudent.status} />
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-semibold text-blue-700">{viewingStudent.courseName}</span>
                  </div>
                </div>
              </div>

              {/* Academic Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Attendance</span>
                  <span
                    className={`block text-xl font-bold font-mono mt-1 ${
                      viewingStudent.attendancePercentage >= 75 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {viewingStudent.attendancePercentage}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Current CGPA</span>
                  <span className="block text-xl font-bold text-slate-900 font-mono mt-1">
                    {viewingStudent.cgpa.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Semester</span>
                  <span className="block text-xl font-bold text-blue-700 font-mono mt-1">
                    {viewingStudent.currentSemester}th
                  </span>
                </div>
              </div>

              {/* Personal & Contact Details */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Personal & Contact Information
                </h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Institutional Email</span>
                    <span className="font-medium text-slate-800">{viewingStudent.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Phone Number</span>
                    <span className="font-mono text-slate-800">{viewingStudent.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Date of Birth</span>
                    <span className="font-mono text-slate-800">{viewingStudent.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Blood Group</span>
                    <span className="font-medium text-slate-800">{viewingStudent.bloodGroup || 'Not specified'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Permanent Address</span>
                    <span className="text-slate-800">{viewingStudent.address}</span>
                  </div>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="pt-4 border-t border-slate-100">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Parent / Guardian Details
                </h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Guardian Name</span>
                    <span className="font-medium text-slate-800">{viewingStudent.guardianName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Emergency Contact</span>
                    <span className="font-mono text-slate-800">{viewingStudent.guardianPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Register New Student</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Student Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sourav Mohanty"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Roll Number *</label>
                  <input
                    type="text"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    placeholder="e.g. 2401020390"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course / Program *</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sourav.m@cgu-odisha.ac.in"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 94371 00221"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.currentSemester}
                    onChange={(e) => setFormData({ ...formData, currentSemester: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    placeholder="e.g. Ashok Mohanty"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guardian Contact Phone</label>
                  <input
                    type="text"
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    placeholder="+91 98610 99887"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Permanent Residential Address</label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Plot 10, Jagamara, Bhubaneswar, Odisha"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Edit Student — {editingStudent.rollNumber}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Name</label>
                  <input
                    type="text"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={editingStudent.rollNumber}
                    onChange={(e) => setEditingStudent({ ...editingStudent, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={editingStudent.currentSemester}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        currentSemester: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingStudent.status}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        status: e.target.value as 'active' | 'inactive',
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={editingStudent.cgpa}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        cgpa: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attendance Percentage</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={editingStudent.attendancePercentage}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        attendancePercentage: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Address</label>
                  <textarea
                    rows={2}
                    value={editingStudent.address}
                    onChange={(e) => setEditingStudent({ ...editingStudent, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingStudent}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete student "${deletingStudent?.name}" (${deletingStudent?.rollNumber})? This will also remove associated academic marks and attendance histories.`}
        confirmLabel="Delete Student"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingStudent(null)}
      />
    </div>
  );
};
