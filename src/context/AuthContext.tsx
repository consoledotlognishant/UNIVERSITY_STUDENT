import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, RegisterData, LoginResult, RegisterResult } from '../types';
import { StorageService } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password?: string) => LoginResult;
  register: (data: RegisterData) => RegisterResult;
  logout: () => void;
  updateCurrentUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'udis_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = (usernameOrEmail: string, password?: string): LoginResult => {
    const users = StorageService.getUsers();
    const query = usernameOrEmail.trim().toLowerCase();

    if (!query) {
      return {
        success: false,
        message: 'Please enter your username or registered university email.',
        errorType: 'ERROR',
      };
    }

    // Strictly find matching user by username or email
    const matchedUser = users.find(
      (u) => u.username.toLowerCase() === query || u.email.toLowerCase() === query
    );

    // If no registered user found - REJECT: user must be registered first
    if (!matchedUser) {
      return {
        success: false,
        message: 'No registered account found with these credentials. You must be registered first before signing in.',
        errorType: 'NOT_REGISTERED',
      };
    }

    // Check account status
    if (matchedUser.status === 'inactive') {
      return {
        success: false,
        message: 'Your account is deactivated. Please contact the Department Administrator.',
        errorType: 'INACTIVE',
      };
    }

    // Verify password if provided on account
    const expectedPassword = matchedUser.password || 'password123';
    if (password && password !== expectedPassword) {
      return {
        success: false,
        message: 'Invalid password. Please check your credentials and try again.',
        errorType: 'INVALID_PASSWORD',
      };
    }

    const activeUser: User = {
      ...matchedUser,
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setUser(activeUser);
    StorageService.updateUser(activeUser);

    return {
      success: true,
      message: `Welcome back, ${activeUser.name}!`,
      user: activeUser,
    };
  };

  const register = (data: RegisterData): RegisterResult => {
    const users = StorageService.getUsers();
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    // Check username uniqueness
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return {
        success: false,
        message: 'This username is already taken. Please select a different username.',
      };
    }

    // Check email uniqueness
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        message: 'An account with this institutional email already exists. Please sign in instead.',
      };
    }

    // Create corresponding domain entity so dashboard has full functionality
    if (data.role === 'student') {
      const students = StorageService.getStudents();
      const existingStudent = students.find(
        (s) => (data.rollNumber && s.rollNumber === data.rollNumber) || s.email.toLowerCase() === cleanEmail
      );

      if (!existingStudent) {
        StorageService.addStudent({
          studentId: `STU${Date.now().toString().slice(-6)}`,
          name: data.name.trim(),
          rollNumber: data.rollNumber?.trim() || `24010${Math.floor(1000 + Math.random() * 9000)}`,
          departmentId: data.departmentId,
          departmentName: data.departmentName,
          courseId: data.courseId || 'course-btech-cse',
          courseName: data.courseName || 'B.Tech CSE',
          currentSemester: data.currentSemester || 5,
          email: cleanEmail,
          phone: data.phone || '+91 98765 43210',
          dateOfBirth: '2004-01-01',
          bloodGroup: 'B+',
          address: 'Campus Hostel / Bhubaneswar',
          guardianName: 'Guardian',
          guardianPhone: '+91 98765 00000',
          enrollmentYear: 2024,
          status: 'active',
          cgpa: 8.5,
          attendancePercentage: 85.0,
          registeredAt: new Date().toISOString(),
        });
      } else {
        StorageService.updateStudent({
          ...existingStudent,
          registeredAt: new Date().toISOString(),
          status: 'active',
        });
      }
    } else if (data.role === 'faculty') {
      const facultyList = StorageService.getFaculty();
      const existingFaculty = facultyList.find(
        (f) => (data.facultyId && f.facultyId === data.facultyId) || f.email.toLowerCase() === cleanEmail
      );

      if (!existingFaculty) {
        StorageService.addFaculty({
          facultyId: data.facultyId?.trim() || `FAC-${data.departmentName.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
          name: data.name.trim(),
          departmentId: data.departmentId,
          departmentName: data.departmentName,
          designation: data.designation || 'Assistant Professor',
          email: cleanEmail,
          phone: data.phone || '+91 94370 00000',
          qualification: data.qualification || 'M.Tech / Ph.D in Computer Science',
          specialization: data.specialization || 'Software Engineering & Computing',
          joiningDate: new Date().toISOString().split('T')[0],
          assignedSubjectIds: ['subj-cs301'],
          status: 'active',
          officeRoom: 'Department Block, Room 302',
          registeredAt: new Date().toISOString(),
        });
      } else {
        StorageService.updateFaculty({
          ...existingFaculty,
          registeredAt: new Date().toISOString(),
          status: 'active',
        });
      }
    }

    // Create user record
    const newUser = StorageService.addUser({
      username: data.username.trim(),
      password: data.password,
      name: data.name.trim(),
      email: cleanEmail,
      role: data.role,
      departmentId: data.departmentId,
      departmentName: data.departmentName,
      phone: data.phone,
      rollNumber: data.rollNumber,
      facultyId: data.facultyId,
      designation: data.designation,
      courseName: data.courseName,
      currentSemester: data.currentSemester,
      status: 'active',
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
      registeredAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: `Account registered successfully for ${newUser.name}. You can now sign in.`,
      user: newUser,
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateCurrentUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    StorageService.updateUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
