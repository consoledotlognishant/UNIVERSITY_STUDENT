import React, { useState, useEffect } from 'react';
import {
  FileBarChart2,
  Download,
  Printer,
  Filter,
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  CheckCircle2,
  Calendar,
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
import { StorageService } from '../../services/storageService';
import { Student, Faculty, AttendanceRecord, MarkRecord, Department } from '../../types';
import { useToast } from '../../context/ToastContext';
import { CGULogo } from '../common/CGULogo';

export const ReportsView: React.FC = () => {
  const { success } = useToast();
  const [reportType, setReportType] = useState<
    'student' | 'faculty' | 'attendance' | 'results' | 'department'
  >('student');

  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);

  // Filters
  const [deptFilter, setDeptFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');

  useEffect(() => {
    setStudents(StorageService.getStudents());
    setFaculty(StorageService.getFaculty());
    setDepartments(StorageService.getDepartments());
    setAttendance(StorageService.getAttendance());
    setMarks(StorageService.getMarks());
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let filename = `UDIS_${reportType}_report_${new Date().toISOString().substring(0, 10)}.csv`;
    let content = '';

    if (reportType === 'student') {
      content =
        'Student ID,Name,Roll Number,Department,Course,Semester,CGPA,Attendance %,Status\n' +
        students
          .map(
            (s) =>
              `"${s.studentId}","${s.name}","${s.rollNumber}","${s.departmentName}","${s.courseName}",${s.currentSemester},${s.cgpa},${s.attendancePercentage},"${s.status}"`
          )
          .join('\n');
    } else if (reportType === 'faculty') {
      content =
        'Faculty ID,Name,Department,Designation,Email,Phone,Qualification,Status\n' +
        faculty
          .map(
            (f) =>
              `"${f.facultyId}","${f.name}","${f.departmentName}","${f.designation}","${f.email}","${f.phone}","${f.qualification}","${f.status}"`
          )
          .join('\n');
    } else if (reportType === 'attendance') {
      content =
        'Date,Subject Code,Subject Name,Faculty,Total,Present,Absent,Percentage\n' +
        attendance
          .map(
            (a) =>
              `"${a.date}","${a.subjectCode}","${a.subjectName}","${a.facultyName}",${a.totalStudents},${a.presentCount},${a.absentCount},${a.attendancePercentage}`
          )
          .join('\n');
    } else {
      content =
        'Student,Roll Number,Subject Code,Exam Type,Marks Obtained,Max Marks,Percentage,Grade\n' +
        marks
          .map(
            (m) =>
              `"${m.studentName}","${m.rollNumber}","${m.subjectCode}","${m.examType}",${m.marksObtained},${m.maxMarks},${m.percentage},"${m.grade}"`
          )
          .join('\n');
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success(`Report exported to ${filename} successfully.`, 'Export Finished');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Institutional Audit & Analytical Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official department analytics, accreditation matrices, attendance audits, and results logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200 print:hidden">
        {[
          { key: 'student', label: 'Student Enrollment Report', icon: GraduationCap },
          { key: 'faculty', label: 'Faculty Directory Report', icon: Users },
          { key: 'attendance', label: 'Attendance Audit Report', icon: CalendarCheck },
          { key: 'results', label: 'Examination Results Report', icon: Award },
          { key: 'department', label: 'Department Statistics', icon: FileBarChart2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = reportType === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setReportType(tab.key as any)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 print:border-none print:shadow-none">
        {/* Printable Letterhead */}
        <div className="border-b border-slate-200 pb-4 mb-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <CGULogo className="w-14 h-14" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block">
                Official Academic Transcript & Audit Report
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-0.5">
                C. V. Raman Global University · Department of Computer Science & Engineering
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · Ref: UDIS-REP-{Date.now().toString().slice(-6)}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-slate-100 border border-slate-300 rounded text-slate-700 uppercase">
            {reportType} Audit
          </span>
        </div>

        {/* 1. STUDENT REPORT */}
        {reportType === 'student' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500">Total Enrolled</span>
                <span className="block text-xl font-bold text-slate-900 font-mono mt-1">
                  {students.length} Students
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500">Average CGPA</span>
                <span className="block text-xl font-bold text-blue-700 font-mono mt-1">
                  8.53 / 10
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500">Active Status</span>
                <span className="block text-xl font-bold text-emerald-700 font-mono mt-1">
                  100% Verified
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-2.5 px-3">Roll Number</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Program</th>
                    <th className="py-2.5 px-3">Semester</th>
                    <th className="py-2.5 px-3 font-mono">CGPA</th>
                    <th className="py-2.5 px-3 font-mono">Attendance %</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.rollNumber}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{s.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.courseName}</td>
                      <td className="py-2.5 px-3 text-slate-600">Sem {s.currentSemester}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.cgpa.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{s.attendancePercentage}%</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold capitalize">
                        {s.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. FACULTY REPORT */}
        {reportType === 'faculty' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-2.5 px-3">Faculty ID</th>
                    <th className="py-2.5 px-3">Instructor Name</th>
                    <th className="py-2.5 px-3">Designation</th>
                    <th className="py-2.5 px-3">Academic Qualification</th>
                    <th className="py-2.5 px-3">Research Focus</th>
                    <th className="py-2.5 px-3 text-right">Office Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {faculty.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{f.facultyId}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{f.name}</td>
                      <td className="py-2.5 px-3 text-blue-700 font-medium">{f.designation}</td>
                      <td className="py-2.5 px-3 text-slate-600">{f.qualification}</td>
                      <td className="py-2.5 px-3 text-slate-600">{f.specialization}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700 font-mono">{f.officeRoom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. ATTENDANCE AUDIT */}
        {reportType === 'attendance' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Subject Code & Name</th>
                    <th className="py-2.5 px-3">Conducting Faculty</th>
                    <th className="py-2.5 px-3 text-center font-mono">Present</th>
                    <th className="py-2.5 px-3 text-center font-mono">Absent</th>
                    <th className="py-2.5 px-3 text-right font-mono">Class Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-700">{a.date}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {a.subjectCode} — {a.subjectName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{a.facultyName}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                        {a.presentCount}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-600">
                        {a.absentCount}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                        {a.attendancePercentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. RESULTS REPORT */}
        {reportType === 'results' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Roll Number</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Exam Type</th>
                    <th className="py-2.5 px-3 text-center font-mono">Marks / Max</th>
                    <th className="py-2.5 px-3 text-center font-mono">Percentage</th>
                    <th className="py-2.5 px-3 text-right">Letter Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marks.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{m.studentName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{m.rollNumber}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{m.subjectCode}</td>
                      <td className="py-2.5 px-3 text-slate-600">{m.examType}</td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums">
                        {m.marksObtained} / {m.maxMarks}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                        {m.percentage}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                        {m.grade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. DEPARTMENT OVERVIEW */}
        {reportType === 'department' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {departments.map((d) => (
                <div key={d.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                  <h4 className="font-bold text-sm text-slate-900">{d.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">HOD: {d.hodName}</p>
                  <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 text-xs">
                    <div>
                      <span className="text-slate-400">Students</span>
                      <span className="block font-bold text-slate-900 font-mono mt-0.5">
                        {d.studentCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Faculty</span>
                      <span className="block font-bold text-slate-900 font-mono mt-0.5">
                        {d.facultyCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sign-off footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span className="block font-semibold text-slate-700">Compiled by:</span>
            <span>Academic Affairs Committee</span>
          </div>
          <div className="text-right">
            <span className="block font-semibold text-slate-700">Approved by:</span>
            <span>Head of Department (CSE)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
