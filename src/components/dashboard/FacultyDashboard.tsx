import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CalendarCheck,
  FileCheck2,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BellRing,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { NavItemKey } from '../common/Sidebar';
import { Subject, Student, TimetableSlot, Notice, Faculty } from '../../types';

interface FacultyDashboardProps {
  onNavigate: (tab: NavItemKey) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [facultyInfo, setFacultyInfo] = useState<Faculty | null>(null);
  const [assignedSubjects, setAssignedSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [todayClasses, setTodayClasses] = useState<TimetableSlot[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const allFaculty = StorageService.getFaculty();
    // Match faculty by facultyId, email, or name
    const current =
      allFaculty.find(
        (f) =>
          (user?.facultyId && f.facultyId.toLowerCase() === user.facultyId.toLowerCase()) ||
          f.email.toLowerCase() === user?.email.toLowerCase() ||
          (user?.name && f.name.toLowerCase().includes(user.name.toLowerCase()))
      ) ||
      allFaculty[0];
    setFacultyInfo(current);

    const allSubjects = StorageService.getSubjects();
    const mySubjs = allSubjects.filter(
      (s) =>
        s.assignedFacultyId === current?.id ||
        current?.assignedSubjectIds.includes(s.id) ||
        s.assignedFacultyName?.includes(user?.name || '')
    );
    setAssignedSubjects(mySubjs.length > 0 ? mySubjs : [allSubjects[1]]);

    setStudents(StorageService.getStudents());
    const timetable = StorageService.getTimetable();
    // Monday/Wednesday schedule sample
    const todaySlots = timetable.filter(
      (t) => t.facultyName.includes('Ananya') || t.facultyName === current?.name
    );
    setTodayClasses(todaySlots.length > 0 ? todaySlots : timetable.slice(0, 2));

    setNotices(
      StorageService.getNotices().filter(
        (n) => n.targetAudience === 'All' || n.targetAudience === 'Faculty'
      )
    );
  }, [user]);

  const totalAssignedStudents = students.length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white rounded-xl border border-slate-200 shadow-2xs gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <span>Faculty Workspace</span>
            <span aria-hidden="true">·</span>
            <span>{facultyInfo?.designation || 'Associate Professor'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Welcome, {user?.name || facultyInfo?.name || 'Faculty Member'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Office: {facultyInfo?.officeRoom || 'Tech Block 3, Room 308'} · Department of Computer Science & Engineering
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('attendance')}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Mark Class Attendance</span>
          </button>
          <button
            onClick={() => onNavigate('marks')}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Enter Marks</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for Faculty */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('my-subjects')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Assigned Subjects
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {assignedSubjects.length}
            </span>
            <span className="text-xs text-slate-500">Active Syllabus</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium group-hover:underline">
            View Curriculum Details →
          </div>
        </div>

        <div
          onClick={() => onNavigate('students')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {totalAssignedStudents}
            </span>
            <span className="text-xs text-slate-500">Across Sections</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium group-hover:underline">
            Student Roster →
          </div>
        </div>

        <div
          onClick={() => onNavigate('attendance')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Class Attendance Avg
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              86.4%
            </span>
            <span className="text-xs text-emerald-600 font-medium">Nominal</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium group-hover:underline">
            Attendance Log →
          </div>
        </div>

        <div
          onClick={() => onNavigate('marks')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Evaluation
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              0
            </span>
            <span className="text-xs text-emerald-600 font-medium">All Uploaded</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium group-hover:underline">
            Results Entry →
          </div>
        </div>
      </div>

      {/* Main Faculty Content: Today's Schedule + Assigned Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Lectures & Lab Timetable */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today's Class Schedule</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Assigned lecture halls and laboratories for today
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">5th Semester CSE</span>
          </div>

          <div className="space-y-3">
            {todayClasses.map((cls) => (
              <div
                key={cls.id}
                className="flex items-start justify-between p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-sm">
                      {cls.subjectCode}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{cls.subjectName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
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

                <button
                  onClick={() => onNavigate('attendance')}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 hover:border-blue-600 rounded-md transition-all shrink-0"
                >
                  Take Roll Call
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Subjects Overview */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">My Teaching Load</h3>
            <button
              onClick={() => onNavigate('my-subjects')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              All Subjects →
            </button>
          </div>

          <div className="space-y-3">
            {assignedSubjects.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-700">{s.code}</span>
                    <h4 className="text-xs font-semibold text-slate-900">{s.name}</h4>
                  </div>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    {s.credits} Credits
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Scheduled: {s.totalClassesScheduled} classes</span>
                  <span className="text-blue-600 font-medium">{s.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Faculty Notices Feed */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Department Circulars for Faculty</h3>
          </div>
          <button
            onClick={() => onNavigate('notices')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            All Notices →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notices.slice(0, 2).map((notice) => (
            <div key={notice.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-semibold text-slate-700">{notice.postedBy}</span>
                <span className="font-mono tabular-nums">{notice.postedDate}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">{notice.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {notice.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
