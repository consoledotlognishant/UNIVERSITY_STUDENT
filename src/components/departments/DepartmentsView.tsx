import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  X,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { Department } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

export const DepartmentsView: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const isAdmin = user?.role === 'admin';

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);

  const initialForm: Omit<Department, 'id'> = {
    code: '',
    name: '',
    hodName: '',
    hodEmail: '',
    establishedYear: 2005,
    description: '',
    facultyCount: 15,
    studentCount: 300,
    coursesOffered: ['B.Tech'],
  };
  const [formData, setFormData] = useState<Omit<Department, 'id'>>(initialForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setDepartments(StorageService.getDepartments());
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      error('Department Name and Code are required.');
      return;
    }
    StorageService.addDepartment(formData);
    loadData();
    setIsAddModalOpen(false);
    setFormData(initialForm);
    success(`Department ${formData.name} successfully registered.`, 'Department Created');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    StorageService.updateDepartment(editingDept);
    loadData();
    setEditingDept(null);
    success(`Department ${editingDept.name} updated.`, 'Changes Saved');
  };

  const handleDeleteConfirm = () => {
    if (!deletingDept) return;
    StorageService.deleteDepartment(deletingDept.id);
    loadData();
    setDeletingDept(null);
    success(`Department ${deletingDept.name} deleted.`, 'Department Removed');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Academic Departments & Centers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Divisions of instruction, leadership details, faculty strength, and accredited degree programs.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        )}
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {dept.code}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{dept.name}</h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Est. {dept.establishedYear}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingDept(dept)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                      title="Edit Department"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingDept(dept)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                {dept.description}
              </p>

              {/* HOD Info */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 mb-4 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Head of Department
                </span>
                <span className="font-semibold text-slate-800 block">{dept.hodName}</span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{dept.hodEmail}</span>
                </span>
              </div>

              {/* Courses Offered */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Degree Programs
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dept.coursesOffered.map((course, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Metrics Footer */}
            <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="block font-bold text-slate-900 font-mono tabular-nums">
                    {dept.facultyCount}
                  </span>
                  <span className="text-[10px] text-slate-500">Faculty Members</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="block font-bold text-slate-900 font-mono tabular-nums">
                    {dept.studentCount}
                  </span>
                  <span className="text-[10px] text-slate-500">Enrolled Students</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Add Academic Department</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. IT"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg uppercase font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Established Year</label>
                  <input
                    type="number"
                    value={formData.establishedYear}
                    onChange={(e) =>
                      setFormData({ ...formData, establishedYear: parseInt(e.target.value) || 2024 })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Information Technology"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Head of Department (HOD)</label>
                  <input
                    type="text"
                    value={formData.hodName}
                    onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
                    placeholder="e.g. Dr. Ramesh Ch. Rath"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">HOD Email</label>
                  <input
                    type="email"
                    value={formData.hodEmail}
                    onChange={(e) => setFormData({ ...formData, hodEmail: e.target.value })}
                    placeholder="hod.it@cgu-odisha.ac.in"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Description / Focus Areas</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of research domains and laboratory setups..."
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
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingDept}
        title="Delete Academic Department"
        message={`Are you sure you want to delete ${deletingDept?.name}? Ensure any associated courses and students are migrated first.`}
        confirmLabel="Delete Department"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingDept(null)}
      />
    </div>
  );
};
