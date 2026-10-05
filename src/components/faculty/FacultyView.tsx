import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  BookOpen,
  Mail,
  Phone,
  Building2,
  X,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { Faculty, Subject, Department } from '../../types';
import { StatusBadge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';

export const FacultyView: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const isAdmin = user?.role === 'admin';

  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingFaculty, setViewingFaculty] = useState<Faculty | null>(null);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [assigningFaculty, setAssigningFaculty] = useState<Faculty | null>(null);
  const [deletingFaculty, setDeletingFaculty] = useState<Faculty | null>(null);

  // Add Faculty Form State
  const initialForm: Omit<Faculty, 'id'> = {
    facultyId: '',
    name: '',
    departmentId: 'dept-cse',
    departmentName: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    email: '',
    phone: '',
    qualification: 'M.Tech / Ph.D.',
    specialization: '',
    joiningDate: '2024-07-01',
    assignedSubjectIds: [],
    status: 'active',
    officeRoom: 'Tech Block 3, Room 202',
  };
  const [formData, setFormData] = useState<Omit<Faculty, 'id'>>(initialForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setFacultyList(StorageService.getFaculty());
    setSubjects(StorageService.getSubjects());
    setDepartments(StorageService.getDepartments());
  };

  const filteredFaculty = facultyList.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.facultyId.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      f.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesDept = departmentFilter === 'all' || f.departmentId === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      error('Faculty Name and Email are required.');
      return;
    }
    const dept = departments.find((d) => d.id === formData.departmentId);
    const newRecord = {
      ...formData,
      facultyId: formData.facultyId || `FAC-CSE-${Date.now().toString().slice(-2)}`,
      departmentName: dept?.name || 'Computer Science & Engineering',
    };
    StorageService.addFaculty(newRecord);
    loadData();
    setIsAddModalOpen(false);
    setFormData(initialForm);
    success(`Faculty member ${newRecord.name} added successfully.`, 'Faculty Added');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;
    StorageService.updateFaculty(editingFaculty);
    loadData();
    setEditingFaculty(null);
    success(`Faculty details for ${editingFaculty.name} updated.`, 'Changes Saved');
  };

  const handleDeleteConfirm = () => {
    if (!deletingFaculty) return;
    StorageService.deleteFaculty(deletingFaculty.id);
    loadData();
    setDeletingFaculty(null);
    success(`Faculty record ${deletingFaculty.name} removed.`, 'Faculty Deleted');
  };

  const handleSaveSubjectAssignments = (facultyId: string, subjectIds: string[]) => {
    const target = facultyList.find((f) => f.id === facultyId);
    if (!target) return;

    const updatedFaculty = { ...target, assignedSubjectIds: subjectIds };
    StorageService.updateFaculty(updatedFaculty);

    // Also update assignedFacultyId in Subjects list
    const allSubjects = StorageService.getSubjects();
    const updatedSubjects = allSubjects.map((s) => {
      if (subjectIds.includes(s.id)) {
        return {
          ...s,
          assignedFacultyId: target.id,
          assignedFacultyName: target.name,
        };
      } else if (s.assignedFacultyId === target.id) {
        // If unassigned
        return {
          ...s,
          assignedFacultyId: undefined,
          assignedFacultyName: undefined,
        };
      }
      return s;
    });
    StorageService.saveSubjects(updatedSubjects);

    loadData();
    setAssigningFaculty(null);
    success(`Subject allocations updated for ${target.name}.`, 'Assignments Saved');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Faculty & Department Instructors
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Teaching directory, academic designations, research specializations, and assigned courses.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setFormData({
                ...initialForm,
                facultyId: `FAC-CSE-0${facultyList.length + 1}`,
              });
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Faculty Member</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by faculty name, designation, or specialization..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Faculty ID</th>
                <th className="py-3 px-4">Faculty Name & Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Assigned Subjects</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredFaculty.map((f) => {
                const assigned = subjects.filter(
                  (s) => f.assignedSubjectIds.includes(s.id) || s.assignedFacultyId === f.id
                );
                return (
                  <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {f.facultyId}
                        </span>
                        {f.registeredAt && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded-xs">
                            Online Reg
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{f.name}</span>
                      <span className="text-[11px] text-blue-700 font-medium block">
                        {f.designation}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">
                        {f.qualification}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-slate-800 font-medium block">{f.departmentName}</span>
                      <span className="text-[11px] text-slate-500 block">{f.officeRoom}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-slate-600 block">{f.email}</span>
                      <span className="text-slate-400 font-mono text-[11px] block">{f.phone}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {assigned.length > 0 ? (
                          assigned.map((s) => (
                            <span
                              key={s.id}
                              className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200"
                              title={s.name}
                            >
                              {s.code}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">None allocated</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={f.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingFaculty(f)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setAssigningFaculty(f)}
                              className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                              title="Assign Subjects"
                            >
                              <BookOpen className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingFaculty(f)}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Edit Faculty"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingFaculty(f)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Delete Faculty"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Subjects Modal */}
      {assigningFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Assign Teaching Subjects</h3>
                <p className="text-xs text-slate-500">
                  Select subjects for {assigningFaculty.name} ({assigningFaculty.designation})
                </p>
              </div>
              <button
                onClick={() => setAssigningFaculty(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto space-y-2">
              {subjects.map((sub) => {
                const isSelected = assigningFaculty.assignedSubjectIds.includes(sub.id);
                return (
                  <label
                    key={sub.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          let updatedIds = [...assigningFaculty.assignedSubjectIds];
                          if (e.target.checked) {
                            updatedIds.push(sub.id);
                          } else {
                            updatedIds = updatedIds.filter((id) => id !== sub.id);
                          }
                          setAssigningFaculty({
                            ...assigningFaculty,
                            assignedSubjectIds: updatedIds,
                          });
                        }}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-blue-700">{sub.code}</span>
                          <span className="font-semibold text-xs text-slate-900">{sub.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {sub.type} · Sem {sub.semester} · {sub.credits} Credits
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAssigningFaculty(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSaveSubjectAssignments(
                    assigningFaculty.id,
                    assigningFaculty.assignedSubjectIds
                  )
                }
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                Save Subject Allocations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Faculty Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Add Faculty Member</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Subrata Behera"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <select
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        designation: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Professor & HOD">Professor & HOD</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">University Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="subrata.b@cgu-odisha.ac.in"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 94370 12345"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="Ph.D. in Computer Science (IIT)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Office Room</label>
                  <input
                    type="text"
                    value={formData.officeRoom}
                    onChange={(e) => setFormData({ ...formData, officeRoom: e.target.value })}
                    placeholder="Tech Block 3, Room 314"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Research Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="Cybersecurity, Machine Learning, Distributed Systems"
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
                  Add Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingFaculty}
        title="Remove Faculty Member"
        message={`Are you sure you want to remove ${deletingFaculty?.name}? Their assigned subjects will need to be reallocated to another instructor.`}
        confirmLabel="Remove Faculty"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingFaculty(null)}
      />
    </div>
  );
};
