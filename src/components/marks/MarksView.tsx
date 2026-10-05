import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  X,
  GraduationCap,
  Award,
  Download,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { MarkRecord, Student, Subject, ExamType } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

export const MarksView: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const role = user?.role || 'student';
  const isStudent = role === 'student';
  const isAdminOrFaculty = role === 'admin' || role === 'faculty';

  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Filtering
  const [search, setSearch] = useState('');
  const [selectedExamType, setSelectedExamType] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMark, setEditingMark] = useState<MarkRecord | null>(null);
  const [deletingMark, setDeletingMark] = useState<MarkRecord | null>(null);

  // New Mark Form
  const initialForm: Omit<MarkRecord, 'id'> = {
    studentId: '',
    studentName: '',
    rollNumber: '',
    subjectId: '',
    subjectName: '',
    subjectCode: '',
    courseId: 'course-btech-cse',
    semester: 5,
    examType: 'Internal',
    maxMarks: 50,
    marksObtained: 40,
    percentage: 80,
    grade: 'A',
    evaluatedBy: user?.name || 'Evaluator',
    evaluationDate: new Date().toISOString().substring(0, 10),
    remarks: '',
  };
  const [formData, setFormData] = useState<Omit<MarkRecord, 'id'>>(initialForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMarks(StorageService.getMarks());
    setStudents(StorageService.getStudents());
    setSubjects(StorageService.getSubjects());
  };

  const calculateGrade = (pct: number): 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F' => {
    if (pct >= 90) return 'O';
    if (pct >= 80) return 'A+';
    if (pct >= 70) return 'A';
    if (pct >= 60) return 'B+';
    if (pct >= 50) return 'B';
    if (pct >= 40) return 'C';
    if (pct >= 35) return 'P';
    return 'F';
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.subjectId) {
      error('Please select both a student and a subject.');
      return;
    }
    const student = students.find((s) => s.id === formData.studentId);
    const subject = subjects.find((s) => s.id === formData.subjectId);

    const pct = Math.round((formData.marksObtained / formData.maxMarks) * 100);
    const grade = calculateGrade(pct);

    const payload = {
      ...formData,
      studentName: student?.name || '',
      rollNumber: student?.rollNumber || '',
      subjectName: subject?.name || '',
      subjectCode: subject?.code || '',
      percentage: pct,
      grade,
    };

    StorageService.addMarkRecord(payload);
    loadData();
    setIsAddModalOpen(false);
    setFormData(initialForm);
    success(`Marks recorded for ${payload.studentName} in ${payload.subjectCode}.`, 'Marks Saved');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMark) return;

    const pct = Math.round((editingMark.marksObtained / editingMark.maxMarks) * 100);
    const grade = calculateGrade(pct);
    const updated = {
      ...editingMark,
      percentage: pct,
      grade,
    };

    StorageService.updateMarkRecord(updated);
    loadData();
    setEditingMark(null);
    success('Marks updated successfully.', 'Changes Saved');
  };

  const handleDeleteConfirm = () => {
    if (!deletingMark) return;
    StorageService.deleteMarkRecord(deletingMark.id);
    loadData();
    setDeletingMark(null);
    success('Marks record deleted successfully.');
  };

  // Student perspective: Filter only their marks
  const currentStudent = students.find(
    (s) =>
      s.rollNumber === user?.username ||
      s.email === user?.email ||
      s.name.includes(user?.name || '')
  ) || students[0];

  const displayedMarks = marks.filter((m) => {
    if (isStudent) {
      const isMine = m.studentId === currentStudent?.id || m.rollNumber === currentStudent?.rollNumber;
      if (!isMine) return false;
    }

    const matchesSearch =
      m.studentName.toLowerCase().includes(search.toLowerCase()) ||
      m.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      m.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      m.subjectCode.toLowerCase().includes(search.toLowerCase());

    const matchesExam = selectedExamType === 'all' || m.examType === selectedExamType;
    const matchesSubject = selectedSubjectFilter === 'all' || m.subjectId === selectedSubjectFilter;

    return matchesSearch && matchesExam && matchesSubject;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {isStudent ? 'My Academic Grade Card & Semester Results' : 'Marks & Results Management Ledger'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous Internal Evaluation (CIE), Sessional Assessments, and Semester Grade Calculations.
          </p>
        </div>

        {isAdminOrFaculty && (
          <button
            onClick={() => {
              if (students.length > 0 && subjects.length > 0) {
                setFormData({
                  ...initialForm,
                  studentId: students[0].id,
                  subjectId: subjects[0].id,
                  evaluatedBy: user?.name || 'Evaluator',
                });
              }
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Enter Student Marks</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, roll, or subject..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Exam Types (Internal, Sessional, External)</option>
            <option value="Internal">Internal Exam</option>
            <option value="Sessional">Sessional Assessment</option>
            <option value="External">External / End-Semester</option>
          </select>
        </div>

        <div>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Student & Roll No</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Exam Type</th>
                <th className="py-3 px-4 text-center">Marks Obtained</th>
                <th className="py-3 px-4 text-center">Max Marks</th>
                <th className="py-3 px-4 text-center">Percentage</th>
                <th className="py-3 px-4 text-center">Letter Grade</th>
                <th className="py-3 px-4">Evaluator</th>
                {isAdminOrFaculty && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedMarks.length > 0 ? (
                displayedMarks.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{m.studentName}</span>
                      <span className="font-mono text-[11px] text-slate-500">{m.rollNumber}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-700 block">{m.subjectCode}</span>
                      <span className="text-slate-800 font-medium block truncate max-w-[180px]">
                        {m.subjectName}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                          m.examType === 'External'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : m.examType === 'Sessional'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {m.examType}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 tabular-nums">
                      {m.marksObtained}
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-slate-500 tabular-nums">
                      {m.maxMarks}
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-blue-700 tabular-nums">
                      {m.percentage}%
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded-sm text-xs ${
                          m.grade === 'O' || m.grade === 'A+'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : m.grade === 'A' || m.grade === 'B+'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {m.grade}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <span className="block truncate max-w-[140px]">{m.evaluatedBy}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{m.evaluationDate}</span>
                    </td>

                    {isAdminOrFaculty && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingMark(m)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Edit Marks"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingMark(m)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">No marks records available</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Enter examination marks for internal or sessional evaluations.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Marks Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Record Student Examination Marks</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.rollNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code} — {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Exam Type</label>
                  <select
                    value={formData.examType}
                    onChange={(e) =>
                      setFormData({ ...formData, examType: e.target.value as ExamType })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="Internal">Internal Exam</option>
                    <option value="Sessional">Sessional Assessment</option>
                    <option value="External">External Examination</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Maximum Marks</label>
                  <input
                    type="number"
                    value={formData.maxMarks}
                    onChange={(e) =>
                      setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 50 })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marks Obtained *</label>
                  <input
                    type="number"
                    max={formData.maxMarks}
                    min={0}
                    value={formData.marksObtained}
                    onChange={(e) =>
                      setFormData({ ...formData, marksObtained: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Evaluator Name</label>
                  <input
                    type="text"
                    value={formData.evaluatedBy}
                    onChange={(e) => setFormData({ ...formData, evaluatedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Faculty Remarks</label>
                  <input
                    type="text"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="e.g. Good theoretical understanding and clean code."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Save Marks Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Marks Modal */}
      {editingMark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Edit Marks — {editingMark.studentName} ({editingMark.subjectCode})
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marks Obtained</label>
                  <input
                    type="number"
                    max={editingMark.maxMarks}
                    min={0}
                    value={editingMark.marksObtained}
                    onChange={(e) =>
                      setEditingMark({
                        ...editingMark,
                        marksObtained: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={editingMark.maxMarks}
                    onChange={(e) =>
                      setEditingMark({
                        ...editingMark,
                        maxMarks: parseInt(e.target.value) || 50,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Faculty Remarks</label>
                  <input
                    type="text"
                    value={editingMark.remarks || ''}
                    onChange={(e) =>
                      setEditingMark({ ...editingMark, remarks: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingMark(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Update Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingMark}
        title="Delete Marks Entry"
        message={`Are you sure you want to delete this marks entry for ${deletingMark?.studentName}?`}
        confirmLabel="Delete Record"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingMark(null)}
      />
    </div>
  );
};
