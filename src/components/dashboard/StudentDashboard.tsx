import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CalendarCheck,
  FileCheck2,
  BookOpen,
  CalendarDays,
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { NavItemKey } from '../common/Sidebar';
import { Student, Subject, MarkRecord, TimetableSlot, Notice } from '../../types';

interface StudentDashboardProps {
  onNavigate: (tab: NavItemKey) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [todayClasses, setTodayClasses] = useState<TimetableSlot[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const students = StorageService.getStudents();
    const current =
      students.find(
        (s) =>
          (user?.rollNumber && s.rollNumber.toLowerCase() === user.rollNumber.toLowerCase()) ||
          s.rollNumber.toLowerCase() === user?.username.toLowerCase() ||
          s.email.toLowerCase() === user?.email.toLowerCase() ||
          (user?.name && s.name.toLowerCase().includes(user.name.toLowerCase()))
      ) || students[0];
    setStudent(current);

    const allSubjs = StorageService.getSubjects().filter((s) => s.semester === 5);
    setSubjects(allSubjs);

    const allMarks = StorageService.getMarks().filter(
      (m) => m.studentId === current?.id || m.rollNumber === current?.rollNumber
    );
    setMarks(allMarks);

    const timetable = StorageService.getTimetable().filter((t) => t.semester === 5);
    setTodayClasses(timetable.slice(0, 3));

    const nots = StorageService.getNotices().filter(
      (n) => n.targetAudience === 'All' || n.targetAudience === 'Students'
    );
    setNotices(nots);
  }, [user]);

  const attendancePct = student?.attendancePercentage || 88.5;
  const isAttendanceEligible = attendancePct >= 75;

  return (
    <div className="space-y-6">
      {/* Student Profile Card Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white rounded-xl border border-slate-200 shadow-2xs gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-900 text-white font-bold text-lg flex items-center justify-center shrink-0 border-2 border-blue-700 shadow-xs">
            {student?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                Roll No: {student?.rollNumber || user?.rollNumber || user?.username}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled & Active
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              {student?.name || user?.name || 'Enrolled Student'}
            </h2>
            <p className="text-xs text-slate-500">
              {student?.courseName || user?.courseName || 'B.Tech CSE'} · Semester {student?.currentSemester || user?.currentSemester || 1} · {student?.departmentName || user?.departmentName || 'Computer Science & Engineering'}
            </p>
          </div>
        </div>

        {/* Academic Overview Pill */}
        <div className="flex items-center gap-4 sm:border-l sm:border-slate-200 sm:pl-6">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Cumulative GPA</span>
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {student?.cgpa || 8.92} <span className="text-xs text-slate-500 font-normal">/ 10</span>
            </span>
          </div>
          <button
            onClick={() => onNavigate('timetable')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CalendarDays className="w-4 h-4" />
            <span>My Timetable</span>
          </button>
        </div>
      </div>

      {/* Attendance Eligibility & Warning Notice if < 75% */}
      {!isAttendanceEligible ? (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-rose-900">
              Attendance Shortage Alert (Current: {attendancePct}%)
            </h4>
            <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
              Your overall attendance is currently below the university's statutory 75% threshold required to obtain mid-semester and end-semester examination hall tickets. Please attend upcoming lectures regularly.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-900">
                Examination Eligibility Verified
              </span>
              <p className="text-xs text-emerald-700">
                Overall attendance is {attendancePct}%, comfortably exceeding the minimum 75% requirement.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('attendance')}
            className="text-xs font-semibold text-emerald-800 hover:underline"
          >
            Subject Breakdown →
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance */}
        <div
          onClick={() => onNavigate('attendance')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overall Attendance
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {attendancePct}%
            </span>
            <span className="text-xs text-emerald-600 font-medium">Eligible</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full ${
                attendancePct >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${attendancePct}%` }}
            />
          </div>
        </div>

        {/* CGPA */}
        <div
          onClick={() => onNavigate('marks')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Current CGPA
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {student?.cgpa || 8.92}
            </span>
            <span className="text-xs text-slate-500">First Class with Dist.</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium group-hover:underline">
            View Grade Sheet →
          </div>
        </div>

        {/* Enrolled Subjects */}
        <div
          onClick={() => onNavigate('my-subjects')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Registered Subjects
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {subjects.length}
            </span>
            <span className="text-xs text-slate-500">20 Total Credits</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium group-hover:underline">
            Course Syllabus →
          </div>
        </div>

        {/* Timetable Lectures */}
        <div
          onClick={() => onNavigate('timetable')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Classes Today
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {todayClasses.length}
            </span>
            <span className="text-xs text-slate-500">Lecture Hall LH-301</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium group-hover:underline">
            Full Schedule →
          </div>
        </div>
      </div>

      {/* Two Column Grid: Today's Lectures + Recent Evaluation Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Lectures */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Today's Class Schedule</h3>
            <button
              onClick={() => onNavigate('timetable')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Full Timetable →
            </button>
          </div>

          <div className="space-y-3">
            {todayClasses.map((cls) => (
              <div
                key={cls.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-700">{cls.subjectCode}</span>
                    <span className="text-xs font-semibold text-slate-800">{cls.subjectName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono tabular-nums">{cls.time}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cls.roomNumber}</span>
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-600 font-medium">{cls.facultyName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Examination Marks */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Marks & Results</h3>
            <button
              onClick={() => onNavigate('marks')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              All Results →
            </button>
          </div>

          <div className="space-y-3">
            {marks.length > 0 ? (
              marks.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-800">{m.subjectCode}</span>
                      <span className="text-xs font-semibold text-slate-800">{m.subjectName}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {m.examType} Exam · Evaluated by {m.evaluatedBy}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-xs font-bold text-blue-700 font-mono tabular-nums">
                        {m.marksObtained}/{m.maxMarks}
                      </span>
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200">
                        {m.grade}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                      {m.percentage}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">
                No evaluation marks uploaded yet for this term.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Enrolled Subjects List */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Current Semester Registered Subjects</h3>
          <span className="text-xs text-slate-500">5th Semester CBCS Curriculum</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <div key={s.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-sm">
                  {s.code}
                </span>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  {s.credits} Credits
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-2">{s.name}</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{s.description}</p>
              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>Instructor:</span>
                <span className="font-medium text-slate-800 truncate max-w-[130px]">
                  {s.assignedFacultyName || 'Assigned Professor'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Notices */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Department Circulars & Bulletins</h3>
          </div>
          <button
            onClick={() => onNavigate('notices')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            All Notices →
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {notices.map((n) => (
            <div key={n.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-2 mb-1">
                {n.priority === 'urgent' && (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-sm border border-rose-200">
                    URGENT
                  </span>
                )}
                <span className="text-xs text-slate-500 font-mono tabular-nums">{n.postedDate}</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-600 font-medium">{n.postedBy}</span>
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900">{n.title}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
