import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Plus,
  Search,
  KeyRound,
  Trash2,
  X,
  CheckCircle2,
  Lock,
  Eye,
  GraduationCap,
  Users as UsersIcon,
  Calendar,
  Mail,
  Phone,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { User, Role, Student, Faculty } from '../../types';
import { StatusBadge } from '../common/Badge';

export const UsersView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [inspectingStudentRecord, setInspectingStudentRecord] = useState<Student | null>(null);
  const [inspectingFacultyRecord, setInspectingFacultyRecord] = useState<Faculty | null>(null);

  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    username: '',
    password: 'password123',
    name: '',
    email: '',
    role: 'faculty',
    departmentId: 'dept-cse',
    departmentName: 'Computer Science & Engineering',
    status: 'active',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(StorageService.getUsers());
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim()) {
      error('Username and Email are required.');
      return;
    }
    StorageService.addUser(formData);
    loadUsers();
    setIsAddUserOpen(false);
    success(`Account for ${formData.name} (${formData.role}) created.`, 'User Provisioned');
  };

  const handleToggleStatus = (u: User) => {
    if (u.id === currentUser?.id) {
      error('You cannot deactivate your own active session account.');
      return;
    }
    const updated = {
      ...u,
      status: (u.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive',
    };
    StorageService.updateUser(updated);
    loadUsers();
    success(`User ${u.username} marked as ${updated.status}.`);
  };

  const handleInspectUserRecord = (u: User) => {
    if (u.role === 'student') {
      const allStudents = StorageService.getStudents();
      const matched = allStudents.find(
        (s) =>
          (u.rollNumber && s.rollNumber.toLowerCase() === u.rollNumber.toLowerCase()) ||
          s.rollNumber.toLowerCase() === u.username.toLowerCase() ||
          s.email.toLowerCase() === u.email.toLowerCase() ||
          s.name.toLowerCase() === u.name.toLowerCase()
      );
      if (matched) {
        setInspectingStudentRecord(matched);
      } else {
        error(`No enrolled student academic file found for ${u.name}.`);
      }
    } else if (u.role === 'faculty') {
      const allFaculty = StorageService.getFaculty();
      const matched = allFaculty.find(
        (f) =>
          (u.facultyId && f.facultyId.toLowerCase() === u.facultyId.toLowerCase()) ||
          f.email.toLowerCase() === u.email.toLowerCase() ||
          f.name.toLowerCase() === u.name.toLowerCase()
      );
      if (matched) {
        setInspectingFacultyRecord(matched);
      } else {
        error(`No faculty appointment record found for ${u.name}.`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            User Accounts & Role-Based Access Control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer institutional user accounts, access roles (Admin/HOD, Faculty, Student), and session permissions.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Provision User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts by username, name, or role..."
            className="w-full sm:w-80 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Username / ID</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users
                .filter(
                  (u) =>
                    u.name.toLowerCase().includes(search.toLowerCase()) ||
                    u.username.toLowerCase().includes(search.toLowerCase()) ||
                    u.role.toLowerCase().includes(search.toLowerCase())
                )
                .map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{u.name}</span>
                      <span className="text-[11px] text-slate-500">{u.email}</span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {u.username}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ${
                          u.role === 'admin'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : u.role === 'faculty'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}
                      >
                        {u.role === 'admin' ? 'HOD / Admin' : u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700">{u.departmentName}</td>

                    <td className="py-3 px-4">
                      <StatusBadge status={u.status} />
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {u.lastLogin || 'Recent'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {(u.role === 'student' || u.role === 'faculty') && (
                          <button
                            type="button"
                            onClick={() => handleInspectUserRecord(u)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md transition-colors cursor-pointer"
                            title={`Inspect ${u.role === 'student' ? 'Student Academic Dossier' : 'Faculty Workload & Profile'}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`text-xs font-semibold px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                            u.status === 'active'
                              ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Provision Portal User</h3>
            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Bikash Panda"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username / Roll *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. bikash.p or 2401020399"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="bikash.p@cgu-odisha.ac.in"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Temporary Password *</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Set account password"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="admin">Admin / HOD</option>
                  <option value="faculty">Faculty / Instructor</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Student Modal */}
      {inspectingStudentRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {inspectingStudentRecord.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">
                    {inspectingStudentRecord.name}
                  </h4>
                  <span className="text-[11px] text-slate-300 font-mono">
                    Roll No: {inspectingStudentRecord.rollNumber} · {inspectingStudentRecord.courseName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingStudentRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">CGPA</span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                    {inspectingStudentRecord.cgpa.toFixed(2)}
                  </span>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Attendance</span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                    {inspectingStudentRecord.attendancePercentage}%
                  </span>
                </div>
                <div className="p-2.5 bg-indigo-50 rounded-lg border border-indigo-200">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 block">Semester</span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                    Semester {inspectingStudentRecord.currentSemester}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider">
                  Academic Information
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Department:</span>
                    <span className="font-medium text-slate-800">{inspectingStudentRecord.departmentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Program:</span>
                    <span className="font-medium text-slate-800">{inspectingStudentRecord.courseName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Student ID:</span>
                    <span className="font-mono text-slate-800">{inspectingStudentRecord.studentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Enrollment Year:</span>
                    <span className="font-mono text-slate-800">{inspectingStudentRecord.enrollmentYear}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider">
                  Personal & Guardian Contacts
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Email:</span>
                    <span className="font-mono text-slate-800 truncate block">{inspectingStudentRecord.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Telephone:</span>
                    <span className="font-mono text-slate-800">{inspectingStudentRecord.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Guardian:</span>
                    <span className="text-slate-800">{inspectingStudentRecord.guardianName} ({inspectingStudentRecord.guardianPhone})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Address:</span>
                    <span className="text-slate-800 truncate block">{inspectingStudentRecord.address}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingStudentRecord(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Faculty Modal */}
      {inspectingFacultyRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {inspectingFacultyRecord.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">
                    {inspectingFacultyRecord.name}
                  </h4>
                  <span className="text-[11px] text-slate-300 font-mono">
                    ID: {inspectingFacultyRecord.facultyId} · {inspectingFacultyRecord.designation}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingFacultyRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider">
                  Academic Appointment Details
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Department:</span>
                    <span className="font-medium text-slate-800">{inspectingFacultyRecord.departmentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Designation:</span>
                    <span className="font-semibold text-emerald-800">{inspectingFacultyRecord.designation}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Qualifications:</span>
                    <span className="font-medium text-slate-800">{inspectingFacultyRecord.qualification}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Specialization:</span>
                    <span className="text-slate-800">{inspectingFacultyRecord.specialization || 'Computing Systems & Algorithms'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider">
                  Contact & Office
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Institutional Email:</span>
                    <span className="font-mono text-slate-800">{inspectingFacultyRecord.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Contact Telephone:</span>
                    <span className="font-mono text-slate-800">{inspectingFacultyRecord.phone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Office Room / Cabin:</span>
                    <span className="font-semibold text-slate-800">{inspectingFacultyRecord.officeRoom}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingFacultyRecord(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
