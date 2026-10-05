import {
  Department,
  Course,
  Subject,
  Student,
  Faculty,
  User,
  AttendanceRecord,
  MarkRecord,
  Notice,
  TimetableSlot,
  SystemSettings
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_DEPARTMENTS,
  INITIAL_COURSES,
  INITIAL_SUBJECTS,
  INITIAL_FACULTY,
  INITIAL_STUDENTS,
  INITIAL_USERS,
  INITIAL_ATTENDANCE,
  INITIAL_MARKS,
  INITIAL_NOTICES,
  INITIAL_TIMETABLE,
} from './mockData';

const STORAGE_KEYS = {
  SETTINGS: 'udis_settings',
  DEPARTMENTS: 'udis_departments',
  COURSES: 'udis_courses',
  SUBJECTS: 'udis_subjects',
  FACULTY: 'udis_faculty',
  STUDENTS: 'udis_students',
  USERS: 'udis_users',
  ATTENDANCE: 'udis_attendance',
  MARKS: 'udis_marks',
  NOTICES: 'udis_notices',
  TIMETABLE: 'udis_timetable',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save to localStorage (${key}):`, e);
  }
}

export const StorageService = {
  // Settings
  getSettings: (): SystemSettings => getItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
  saveSettings: (settings: SystemSettings) => setItem(STORAGE_KEYS.SETTINGS, settings),

  // Departments
  getDepartments: (): Department[] => getItem(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS),
  saveDepartments: (depts: Department[]) => setItem(STORAGE_KEYS.DEPARTMENTS, depts),
  addDepartment: (dept: Omit<Department, 'id'>): Department => {
    const list = StorageService.getDepartments();
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
    };
    StorageService.saveDepartments([newDept, ...list]);
    return newDept;
  },
  updateDepartment: (updated: Department) => {
    const list = StorageService.getDepartments().map(d => d.id === updated.id ? updated : d);
    StorageService.saveDepartments(list);
  },
  deleteDepartment: (id: string) => {
    const list = StorageService.getDepartments().filter(d => d.id !== id);
    StorageService.saveDepartments(list);
  },

  // Courses
  getCourses: (): Course[] => getItem(STORAGE_KEYS.COURSES, INITIAL_COURSES),
  saveCourses: (courses: Course[]) => setItem(STORAGE_KEYS.COURSES, courses),
  addCourse: (course: Omit<Course, 'id'>): Course => {
    const list = StorageService.getCourses();
    const newCourse: Course = { ...course, id: `course-${Date.now()}` };
    StorageService.saveCourses([newCourse, ...list]);
    return newCourse;
  },
  updateCourse: (updated: Course) => {
    const list = StorageService.getCourses().map(c => c.id === updated.id ? updated : c);
    StorageService.saveCourses(list);
  },
  deleteCourse: (id: string) => {
    const list = StorageService.getCourses().filter(c => c.id !== id);
    StorageService.saveCourses(list);
  },

  // Subjects
  getSubjects: (): Subject[] => getItem(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS),
  saveSubjects: (subjects: Subject[]) => setItem(STORAGE_KEYS.SUBJECTS, subjects),
  addSubject: (subject: Omit<Subject, 'id'>): Subject => {
    const list = StorageService.getSubjects();
    const newSubj: Subject = { ...subject, id: `subj-${Date.now()}` };
    StorageService.saveSubjects([newSubj, ...list]);
    return newSubj;
  },
  updateSubject: (updated: Subject) => {
    const list = StorageService.getSubjects().map(s => s.id === updated.id ? updated : s);
    StorageService.saveSubjects(list);
  },
  deleteSubject: (id: string) => {
    const list = StorageService.getSubjects().filter(s => s.id !== id);
    StorageService.saveSubjects(list);
  },

  // Faculty
  getFaculty: (): Faculty[] => getItem(STORAGE_KEYS.FACULTY, INITIAL_FACULTY),
  saveFaculty: (faculty: Faculty[]) => setItem(STORAGE_KEYS.FACULTY, faculty),
  addFaculty: (faculty: Omit<Faculty, 'id'>): Faculty => {
    const list = StorageService.getFaculty();
    const newFac: Faculty = { ...faculty, id: `fac-${Date.now()}` };
    StorageService.saveFaculty([newFac, ...list]);
    return newFac;
  },
  updateFaculty: (updated: Faculty) => {
    const list = StorageService.getFaculty().map(f => f.id === updated.id ? updated : f);
    StorageService.saveFaculty(list);
  },
  deleteFaculty: (id: string) => {
    const list = StorageService.getFaculty().filter(f => f.id !== id);
    StorageService.saveFaculty(list);
  },

  // Students
  getStudents: (): Student[] => getItem(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS),
  saveStudents: (students: Student[]) => setItem(STORAGE_KEYS.STUDENTS, students),
  addStudent: (student: Omit<Student, 'id'>): Student => {
    const list = StorageService.getStudents();
    const newStu: Student = { ...student, id: `stu-${Date.now()}` };
    StorageService.saveStudents([newStu, ...list]);
    return newStu;
  },
  updateStudent: (updated: Student) => {
    const list = StorageService.getStudents().map(s => s.id === updated.id ? updated : s);
    StorageService.saveStudents(list);
  },
  deleteStudent: (id: string) => {
    const list = StorageService.getStudents().filter(s => s.id !== id);
    StorageService.saveStudents(list);
  },

  // Users
  getUsers: (): User[] => {
    const users = getItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    return users.map(u => ({
      ...u,
      password: u.password || 'password123',
    }));
  },
  saveUsers: (users: User[]) => setItem(STORAGE_KEYS.USERS, users),
  addUser: (user: Omit<User, 'id'>): User => {
    const list = StorageService.getUsers();
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      status: user.status || 'active',
      registeredAt: user.registeredAt || new Date().toISOString(),
    };
    StorageService.saveUsers([newUser, ...list]);
    return newUser;
  },
  updateUser: (updated: User) => {
    const list = StorageService.getUsers().map(u => u.id === updated.id ? updated : u);
    StorageService.saveUsers(list);
  },
  deleteUser: (id: string) => {
    const list = StorageService.getUsers().filter(u => u.id !== id);
    StorageService.saveUsers(list);
  },

  // Attendance
  getAttendance: (): AttendanceRecord[] => getItem(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE),
  saveAttendance: (records: AttendanceRecord[]) => setItem(STORAGE_KEYS.ATTENDANCE, records),
  recordAttendance: (record: Omit<AttendanceRecord, 'id'>): AttendanceRecord => {
    const list = StorageService.getAttendance();
    const newRecord: AttendanceRecord = {
      ...record,
      id: `att-${record.date}-${record.subjectId}-${Date.now()}`,
    };
    StorageService.saveAttendance([newRecord, ...list]);
    
    // Also recalculate attendance percentage for affected students
    const allRecords = [newRecord, ...list];
    const students = StorageService.getStudents();
    const updatedStudents = students.map(student => {
      let attended = 0;
      let total = 0;
      allRecords.forEach(rec => {
        const entry = rec.entries.find(e => e.studentId === student.id || e.rollNumber === student.rollNumber);
        if (entry) {
          total++;
          if (entry.status === 'present') attended++;
        }
      });
      const pct = total > 0 ? Math.round((attended / total) * 1000) / 10 : student.attendancePercentage;
      return { ...student, attendancePercentage: pct };
    });
    StorageService.saveStudents(updatedStudents);

    return newRecord;
  },

  // Marks
  getMarks: (): MarkRecord[] => getItem(STORAGE_KEYS.MARKS, INITIAL_MARKS),
  saveMarks: (marks: MarkRecord[]) => setItem(STORAGE_KEYS.MARKS, marks),
  addMarkRecord: (mark: Omit<MarkRecord, 'id'>): MarkRecord => {
    const list = StorageService.getMarks();
    const newMark: MarkRecord = { ...mark, id: `mrk-${Date.now()}` };
    StorageService.saveMarks([newMark, ...list]);
    return newMark;
  },
  updateMarkRecord: (updated: MarkRecord) => {
    const list = StorageService.getMarks().map(m => m.id === updated.id ? updated : m);
    StorageService.saveMarks(list);
  },
  deleteMarkRecord: (id: string) => {
    const list = StorageService.getMarks().filter(m => m.id !== id);
    StorageService.saveMarks(list);
  },

  // Notices
  getNotices: (): Notice[] => getItem(STORAGE_KEYS.NOTICES, INITIAL_NOTICES),
  saveNotices: (notices: Notice[]) => setItem(STORAGE_KEYS.NOTICES, notices),
  addNotice: (notice: Omit<Notice, 'id'>): Notice => {
    const list = StorageService.getNotices();
    const newNotice: Notice = { ...notice, id: `not-${Date.now()}` };
    StorageService.saveNotices([newNotice, ...list]);
    return newNotice;
  },
  updateNotice: (updated: Notice) => {
    const list = StorageService.getNotices().map(n => n.id === updated.id ? updated : n);
    StorageService.saveNotices(list);
  },
  deleteNotice: (id: string) => {
    const list = StorageService.getNotices().filter(n => n.id !== id);
    StorageService.saveNotices(list);
  },

  // Timetable
  getTimetable: (): TimetableSlot[] => getItem(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE),

  // Reset all
  resetAll: () => {
    localStorage.clear();
  }
};
