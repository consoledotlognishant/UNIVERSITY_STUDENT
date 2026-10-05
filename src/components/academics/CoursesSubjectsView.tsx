import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  BookMarked,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  X,
  UserCheck,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { Course, Subject, Faculty, Department } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

interface CoursesSubjectsViewProps {
  initialTab?: 'courses' | 'subjects';
}

export const CoursesSubjectsView: React.FC<CoursesSubjectsViewProps> = ({ initialTab = 'subjects' }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'courses' | 'subjects'>(initialTab);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');

  // Course Modals
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  // Subject Modals
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  // Course Form
  const [courseForm, setCourseForm] = useState<Omit<Course, 'id'>>({
    code: '',
    name: '',
    departmentId: 'dept-cse',
    durationYears: 4,
    totalSemesters: 8,
    degreeType: 'Undergraduate',
    curriculumVersion: 'Rev-2024-CBCS',
    status: 'active',
  });

  // Subject Form
  const [subjectForm, setSubjectForm] = useState<Omit<Subject, 'id'>>({
    code: '',
    name: '',
    departmentId: 'dept-cse',
    courseId: 'course-btech-cse',
    semester: 5,
    credits: 4,
    type: 'Theory',
    assignedFacultyId: '',
    assignedFacultyName: '',
    totalClassesScheduled: 40,
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCourses(StorageService.getCourses());
    setSubjects(StorageService.getSubjects());
    setFaculty(StorageService.getFaculty());
    setDepartments(StorageService.getDepartments());
  };

  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.name || !courseForm.code) {
      error('Course name and code are required.');
      return;
    }
    StorageService.addCourse(courseForm);
    loadData();
    setIsAddCourseOpen(false);
    success(`Course ${courseForm.name} added successfully.`, 'Course Created');
  };

  const handleDeleteCourse = () => {
    if (!deletingCourse) return;
    StorageService.deleteCourse(deletingCourse.id);
    loadData();
    setDeletingCourse(null);
    success(`Course ${deletingCourse.name} deleted.`, 'Course Removed');
  };

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name || !subjectForm.code) {
      error('Subject name and code are required.');
      return;
    }
    const assignedFac = faculty.find((f) => f.id === subjectForm.assignedFacultyId);
    const payload = {
      ...subjectForm,
      assignedFacultyName: assignedFac?.name,
    };
    StorageService.addSubject(payload);
    loadData();
    setIsAddSubjectOpen(false);
    success(`Subject ${subjectForm.name} (${subjectForm.code}) created.`, 'Subject Added');
  };

  const handleEditSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    const assignedFac = faculty.find((f) => f.id === editingSubject.assignedFacultyId);
    const updated = {
      ...editingSubject,
      assignedFacultyName: assignedFac ? assignedFac.name : undefined,
    };
    StorageService.updateSubject(updated);
    loadData();
    setEditingSubject(null);
    success(`Subject ${updated.name} updated successfully.`, 'Changes Saved');
  };

  const handleDeleteSubject = () => {
    if (!deletingSubject) return;
    StorageService.deleteSubject(deletingSubject.id);
    loadData();
    setDeletingSubject(null);
    success(`Subject ${deletingSubject.name} deleted.`, 'Subject Removed');
  };

  return (
    <div className="space-y-6">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Academic Curriculum & Subject Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage degree programs, credit distributions, course modules, and faculty assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('subjects')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'subjects'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Subjects & Modules ({subjects.length})
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'courses'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Degree Programs ({courses.length})
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={() => (activeTab === 'subjects' ? setIsAddSubjectOpen(true) : setIsAddCourseOpen(true))}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'subjects' ? 'Add Subject' : 'Add Course'}</span>
            </button>
          )}
        </div>
      </div>

      {/* SUBJECTS TAB CONTENT */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subjects by code or title..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Subject Code</th>
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-4">Semester & Credits</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Assigned Instructor</th>
                    <th className="py-3 px-4">Scheduled Classes</th>
                    {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {subjects
                    .filter(
                      (s) =>
                        s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.code.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((subj) => (
                      <tr key={subj.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">
                          {subj.code}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {subj.name}
                          <span className="block text-[11px] text-slate-500 font-normal line-clamp-1">
                            {subj.description}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono tabular-nums text-slate-800 font-semibold block">
                            Semester {subj.semester}
                          </span>
                          <span className="text-[11px] text-slate-500">{subj.credits} Credit Hours</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
                              subj.type === 'Practical'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {subj.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {subj.assignedFacultyName ? (
                            <span className="font-medium text-slate-800 block">
                              {subj.assignedFacultyName}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                          {subj.totalClassesScheduled} lectures
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setEditingSubject(subj)}
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                title="Edit Subject"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingSubject(subj)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                title="Delete Subject"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* COURSES TAB CONTENT */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                    {course.code}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700">
                    {course.degreeType}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug mt-1">
                  {course.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  Curriculum: {course.curriculumVersion}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div>
                  <span className="block font-bold text-slate-900 font-mono tabular-nums">
                    {course.durationYears} Years ({course.totalSemesters} Semesters)
                  </span>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setDeletingCourse(course)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Course Modal */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Degree Program</h3>
            <form onSubmit={handleAddCourseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Code *</label>
                <input
                  type="text"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. BTECH-CSE"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  placeholder="Bachelor of Technology in ..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={courseForm.durationYears}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, durationYears: parseInt(e.target.value) || 4 })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Semesters</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={courseForm.totalSemesters}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, totalSemesters: parseInt(e.target.value) || 8 })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddCourseOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Curriculum Subject</h3>
            <form onSubmit={handleAddSubjectSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CS305"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
                  <input
                    type="text"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                    placeholder="e.g. Computer Networks"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={subjectForm.semester}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, semester: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={subjectForm.credits}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) || 3 })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category Type</label>
                  <select
                    value={subjectForm.type}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, type: e.target.value as 'Theory' | 'Practical' | 'Elective' })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical / Lab</option>
                    <option value="Elective">Elective</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Faculty Instructor</label>
                  <select
                    value={subjectForm.assignedFacultyId}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, assignedFacultyId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="">Unassigned</option>
                    {faculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Description / Syllabus</label>
                  <textarea
                    rows={2}
                    value={subjectForm.description}
                    onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                    placeholder="Brief description of modules and course learning outcomes..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-4">Edit Subject — {editingSubject.code}</h3>
            <form onSubmit={handleEditSubjectSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={editingSubject.code}
                    onChange={(e) => setEditingSubject({ ...editingSubject, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={editingSubject.name}
                    onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={editingSubject.semester}
                    onChange={(e) =>
                      setEditingSubject({
                        ...editingSubject,
                        semester: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={editingSubject.credits}
                    onChange={(e) =>
                      setEditingSubject({
                        ...editingSubject,
                        credits: parseInt(e.target.value) || 3,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Faculty</label>
                  <select
                    value={editingSubject.assignedFacultyId || ''}
                    onChange={(e) =>
                      setEditingSubject({
                        ...editingSubject,
                        assignedFacultyId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="">Unassigned</option>
                    {faculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Subject Confirmation */}
      <ConfirmModal
        isOpen={!!deletingSubject}
        title="Delete Subject"
        message={`Are you sure you want to remove ${deletingSubject?.name} (${deletingSubject?.code})?`}
        confirmLabel="Delete Subject"
        isDestructive={true}
        onConfirm={handleDeleteSubject}
        onCancel={() => setDeletingSubject(null)}
      />

      {/* Delete Course Confirmation */}
      <ConfirmModal
        isOpen={!!deletingCourse}
        title="Delete Course Program"
        message={`Are you sure you want to delete ${deletingCourse?.name}?`}
        confirmLabel="Delete Course"
        isDestructive={true}
        onConfirm={handleDeleteCourse}
        onCancel={() => setDeletingCourse(null)}
      />
    </div>
  );
};
