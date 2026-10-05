import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Calendar,
  Check,
  X as CloseIcon,
  Save,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Users,
  Search,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import {
  Course,
  Subject,
  Student,
  AttendanceRecord,
  AttendanceEntry,
} from '../../types';

export const AttendanceView: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const role = user?.role || 'student';
  const isStudent = role === 'student';

  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Selection filters for roll call
  const [selectedCourseId, setSelectedCourseId] = useState('course-btech-cse');
  const [selectedSubjectId, setSelectedSubjectId] = useState('subj-cs302');
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().substring(0, 10)
  );

  // Roll call roster for the selected subject & date
  const [rosterEntries, setRosterEntries] = useState<AttendanceEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const cList = StorageService.getCourses();
    const sList = StorageService.getSubjects();
    const stList = StorageService.getStudents();
    const aList = StorageService.getAttendance();

    setCourses(cList);
    setSubjects(sList);
    setStudents(stList);
    setAttendanceRecords(aList);

    if (sList.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(sList[0].id);
    }
  };

  // Sync roster when subject, date, or student list changes
  useEffect(() => {
    if (students.length === 0) return;

    // Check if attendance was already recorded for this subject & date
    const existing = attendanceRecords.find(
      (r) => r.subjectId === selectedSubjectId && r.date === selectedDate
    );

    if (existing) {
      setRosterEntries(existing.entries);
    } else {
      // Default all to 'present' for convenient quick roll call
      const initial: AttendanceEntry[] = students
        .filter((s) => s.courseId === selectedCourseId)
        .map((s) => ({
          studentId: s.id,
          studentName: s.name,
          rollNumber: s.rollNumber,
          status: 'present',
        }));
      setRosterEntries(initial);
    }
  }, [selectedCourseId, selectedSubjectId, selectedDate, students, attendanceRecords]);

  const toggleStudentStatus = (studentId: string) => {
    setRosterEntries((prev) =>
      prev.map((e) => {
        if (e.studentId === studentId) {
          return {
            ...e,
            status: e.status === 'present' ? 'absent' : 'present',
          };
        }
        return e;
      })
    );
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    setRosterEntries((prev) => prev.map((e) => ({ ...e, status })));
    success(`All students set to ${status.toUpperCase()}. Click 'Save Attendance' to persist.`);
  };

  const handleSaveAttendance = () => {
    if (rosterEntries.length === 0) {
      error('No students found for this subject and course.');
      return;
    }

    const subject = subjects.find((s) => s.id === selectedSubjectId);
    const course = courses.find((c) => c.id === selectedCourseId);

    const presentCount = rosterEntries.filter((e) => e.status === 'present').length;
    const absentCount = rosterEntries.filter((e) => e.status === 'absent').length;
    const percentage = Math.round((presentCount / rosterEntries.length) * 1000) / 10;

    setIsSaving(true);
    setTimeout(() => {
      StorageService.recordAttendance({
        date: selectedDate,
        courseId: selectedCourseId,
        courseName: course?.name || 'B.Tech CSE',
        subjectId: selectedSubjectId,
        subjectName: subject?.name || 'Subject',
        subjectCode: subject?.code || 'CS',
        facultyId: user?.id || 'fac-001',
        facultyName: user?.name || 'Faculty Instructor',
        semester: subject?.semester || 5,
        entries: rosterEntries,
        totalStudents: rosterEntries.length,
        presentCount,
        absentCount,
        attendancePercentage: percentage,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      });

      loadData();
      setIsSaving(false);
      success(
        `Attendance updated successfully for ${subject?.code} on ${selectedDate} (${percentage}% present).`,
        'Attendance Saved'
      );
    }, 300);
  };

  // Student specific detailed view calculation
  const currentStudent = students.find(
    (s) =>
      s.rollNumber === user?.username ||
      s.email === user?.email ||
      s.name.includes(user?.name || '')
  ) || students[0];

  const studentSubjectBreakdown = subjects.map((sub) => {
    let classesHeld = 0;
    let attended = 0;

    attendanceRecords.forEach((rec) => {
      if (rec.subjectId === sub.id) {
        const entry = rec.entries.find(
          (e) => e.studentId === currentStudent?.id || e.rollNumber === currentStudent?.rollNumber
        );
        if (entry) {
          classesHeld++;
          if (entry.status === 'present') attended++;
        }
      }
    });

    // Provide realistic baseline if few recorded dates
    const total = classesHeld > 0 ? classesHeld : Math.floor(sub.totalClassesScheduled * 0.7);
    const pres = classesHeld > 0 ? attended : Math.floor(total * 0.88);
    const pct = total > 0 ? Math.round((pres / total) * 100) : 85;

    return {
      id: sub.id,
      code: sub.code,
      name: sub.name,
      faculty: sub.assignedFacultyName || 'Faculty',
      totalClasses: total,
      presentClasses: pres,
      absentClasses: total - pres,
      percentage: pct,
      isEligible: pct >= 75,
    };
  });

  const selectedSubjObj = subjects.find((s) => s.id === selectedSubjectId);

  // Present and Absent counts for current active roll call
  const currentPresentCount = rosterEntries.filter((e) => e.status === 'present').length;
  const currentAbsentCount = rosterEntries.filter((e) => e.status === 'absent').length;
  const currentPct =
    rosterEntries.length > 0
      ? Math.round((currentPresentCount / rosterEntries.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {isStudent ? 'My Attendance & Eligibility Ledger' : 'Daily Classroom Roll Call & Attendance'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isStudent
              ? 'Detailed breakdown of subject attendance percentages with statutory 75% examination eligibility tracking.'
              : 'Record session roll calls, audit historical attendance percentages, and identify students below eligibility.'}
          </p>
        </div>

        {!isStudent && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMarkAll('present')}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              All Present
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              All Absent
            </button>
            <button
              onClick={handleSaveAttendance}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Attendance'}</span>
            </button>
          </div>
        )}
      </div>

      {/* STUDENT'S PERSONAL ATTENDANCE VIEW */}
      {isStudent ? (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Academic Term 2026–2027 · 5th Semester
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  Overall Attendance:{' '}
                  <span className="font-mono text-blue-600 tabular-nums">
                    {currentStudent?.attendancePercentage || 88.5}%
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Roll Number: <span className="font-mono font-semibold">{currentStudent?.rollNumber}</span> · Minimum 75% required for hall ticket clearance
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border flex items-center gap-3 ${
                  (currentStudent?.attendancePercentage || 88.5) >= 75
                    ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                    : 'border-rose-200 bg-rose-50 text-rose-900'
                }`}
              >
                {(currentStudent?.attendancePercentage || 88.5) >= 75 ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                )}
                <div>
                  <span className="text-xs font-bold block">
                    {(currentStudent?.attendancePercentage || 88.5) >= 75
                      ? 'Eligible for Examinations'
                      : 'Attendance Shortage Alert'}
                  </span>
                  <span className="text-[11px] block mt-0.5 opacity-90">
                    {(currentStudent?.attendancePercentage || 88.5) >= 75
                      ? 'Compliant with university regulations'
                      : 'Under mandatory 75% criterion'}
                  </span>
                </div>
              </div>
            </div>

            {/* Subject Attendance Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Subject Code & Title</th>
                    <th className="py-3 px-4">Instructor</th>
                    <th className="py-3 px-4 text-center">Conducted</th>
                    <th className="py-3 px-4 text-center">Attended</th>
                    <th className="py-3 px-4 text-center">Absent</th>
                    <th className="py-3 px-4">Percentage & Progress</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentSubjectBreakdown.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-700 block">{item.code}</span>
                        <span className="font-semibold text-slate-900 block">{item.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{item.faculty}</td>
                      <td className="py-3.5 px-4 text-center font-mono tabular-nums text-slate-700">
                        {item.totalClasses}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono tabular-nums text-emerald-700 font-semibold">
                        {item.presentClasses}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono tabular-nums text-rose-600">
                        {item.absentClasses}
                      </td>
                      <td className="py-3.5 px-4 min-w-[160px]">
                        <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                          <span className={item.isEligible ? 'text-emerald-700' : 'text-rose-600'}>
                            {item.percentage}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">Target: 75%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.isEligible ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            item.isEligible ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isEligible ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {item.isEligible ? 'Clear' : 'Shortage'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* FACULTY & ADMIN ATTENDANCE RECORDING VIEW */
        <div className="space-y-6">
          {/* Controls: Course, Subject, Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Degree Program
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Teaching Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name} ({s.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Attendance Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Roll Call Overview Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Enrolled Roster
              </span>
              <span className="block text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                {rosterEntries.length}
              </span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase">
                Marked Present
              </span>
              <span className="block text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
                {currentPresentCount}
              </span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-rose-600 uppercase">
                Marked Absent
              </span>
              <span className="block text-2xl font-bold text-rose-700 font-mono tabular-nums mt-1">
                {currentAbsentCount}
              </span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-blue-600 uppercase">
                Daily Attendance %
              </span>
              <span className="block text-2xl font-bold text-blue-700 font-mono tabular-nums mt-1">
                {currentPct}%
              </span>
            </div>
          </div>

          {/* Interactive Roster Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Student Roll Call Sheet — {selectedSubjObj?.name} ({selectedSubjObj?.code})
                </h3>
                <span className="text-xs text-slate-500 font-mono">Date: {selectedDate}</span>
              </div>
              <span className="text-xs text-slate-500">
                Click any row or button to toggle Present / Absent
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-white text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Overall History %</th>
                    <th className="py-3 px-4 text-center">Current Status</th>
                    <th className="py-3 px-4 text-right">Quick Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rosterEntries.map((entry, index) => {
                    const studentObj = students.find((s) => s.id === entry.studentId);
                    const isPresent = entry.status === 'present';
                    return (
                      <tr
                        key={entry.studentId}
                        onClick={() => toggleStudentStatus(entry.studentId)}
                        className={`cursor-pointer transition-colors ${
                          isPresent ? 'hover:bg-emerald-50/30' : 'bg-rose-50/30 hover:bg-rose-50/50'
                        }`}
                      >
                        <td className="py-3 px-4 text-slate-400 font-mono tabular-nums">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                          {entry.rollNumber}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {entry.studentName}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                          {studentObj?.attendancePercentage || 85}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-mono uppercase ${
                              isPresent
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isPresent ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <CloseIcon className="w-3.5 h-3.5" />
                            )}
                            {entry.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStudentStatus(entry.studentId);
                            }}
                            className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${
                              isPresent
                                ? 'border-rose-300 text-rose-700 hover:bg-rose-50'
                                : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            Mark as {isPresent ? 'Absent' : 'Present'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {currentPresentCount} Present · {currentAbsentCount} Absent · {currentPct}% Total Attendance
              </span>
              <button
                onClick={handleSaveAttendance}
                disabled={isSaving}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save & Publish Attendance'}</span>
              </button>
            </div>
          </div>

          {/* Historical Logs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Class Attendance Records</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {attendanceRecords.slice(0, 5).map((rec) => (
                <div key={rec.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700">{rec.subjectCode}</span>
                      <span className="font-semibold text-slate-800">{rec.subjectName}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Conducted on {rec.date} by {rec.facultyName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 block tabular-nums">
                      {rec.attendancePercentage}% ({rec.presentCount}/{rec.totalStudents})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{rec.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
