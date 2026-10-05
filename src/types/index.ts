export type Role = 'admin' | 'faculty' | 'student';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string;
  departmentName: string;
  avatarUrl?: string;
  phone?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  // Specific role metadata
  rollNumber?: string;
  facultyId?: string;
  designation?: string;
  courseName?: string;
  currentSemester?: number;
  registeredAt?: string;
}

export interface RegisterData {
  username: string;
  password: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string;
  departmentName: string;
  phone?: string;
  // Student-specific
  rollNumber?: string;
  courseId?: string;
  courseName?: string;
  currentSemester?: number;
  // Faculty-specific
  facultyId?: string;
  designation?: 'Professor & HOD' | 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer';
  qualification?: string;
  specialization?: string;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  errorType?: 'NOT_REGISTERED' | 'INVALID_PASSWORD' | 'INACTIVE' | 'ERROR';
  user?: User;
}

export interface RegisterResult {
  success: boolean;
  message?: string;
  user?: User;
}

export interface Student {
  id: string;
  studentId: string; // e.g. STU2024001
  name: string;
  rollNumber: string; // e.g. 21CSE042
  departmentId: string;
  departmentName: string;
  courseId: string;
  courseName: string;
  currentSemester: number;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodGroup?: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  enrollmentYear: number;
  status: 'active' | 'inactive';
  avatarUrl?: string;
  cgpa: number;
  attendancePercentage: number;
  registeredAt?: string;
}

export interface Faculty {
  id: string;
  facultyId: string; // e.g. FAC-CSE-01
  name: string;
  departmentId: string;
  departmentName: string;
  designation: 'Professor & HOD' | 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer';
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  joiningDate: string;
  assignedSubjectIds: string[]; // Subject IDs
  status: 'active' | 'inactive';
  officeRoom: string;
  avatarUrl?: string;
  registeredAt?: string;
}

export interface Department {
  id: string;
  code: string; // e.g. CSE, ECE
  name: string;
  hodName: string;
  hodEmail: string;
  establishedYear: number;
  description: string;
  facultyCount: number;
  studentCount: number;
  coursesOffered: string[];
}

export interface Course {
  id: string;
  code: string; // e.g. BTECH-CSE
  name: string;
  departmentId: string;
  durationYears: number;
  totalSemesters: number;
  degreeType: 'Undergraduate' | 'Postgraduate' | 'Doctoral';
  curriculumVersion: string;
  status: 'active' | 'archived';
}

export interface Subject {
  id: string;
  code: string; // e.g. CS301
  name: string;
  departmentId: string;
  courseId: string;
  semester: number;
  credits: number;
  type: 'Theory' | 'Practical' | 'Elective';
  assignedFacultyId?: string;
  assignedFacultyName?: string;
  totalClassesScheduled: number;
  description?: string;
}

export interface AttendanceEntry {
  studentId: string;
  studentName: string;
  rollNumber: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  courseId: string;
  courseName: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  facultyId: string;
  facultyName: string;
  semester: number;
  entries: AttendanceEntry[];
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
  timestamp: string;
}

export type ExamType = 'Internal' | 'Sessional' | 'External';

export interface MarkRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  courseId: string;
  semester: number;
  examType: ExamType;
  maxMarks: number;
  marksObtained: number;
  percentage: number;
  grade: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F';
  evaluatedBy: string;
  evaluationDate: string;
  remarks?: string;
}

export type NoticeAudience = 'All' | 'Faculty' | 'Students' | 'Department';
export type NoticePriority = 'urgent' | 'high' | 'normal';

export interface Notice {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  postedByRole: string;
  postedDate: string;
  departmentId?: string;
  targetAudience: NoticeAudience;
  priority: NoticePriority;
  status: 'published' | 'draft';
  attachments?: string[];
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  time: string; // e.g. 09:00 AM - 10:00 AM
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  roomNumber: string;
  courseId: string;
  semester: number;
}

export interface SystemSettings {
  academicYear: string;
  currentSemesterType: 'Odd' | 'Even';
  minAttendancePercentage: number; // default 75
  universityName: string;
  departmentName: string;
  gradingScheme: 'Standard 10-Point' | 'Relative Grading';
}
