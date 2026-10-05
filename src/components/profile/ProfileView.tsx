import React, { useState } from 'react';
import {
  UserCircle2,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  Save,
  KeyRound,
  GraduationCap,
  Calendar,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ProfileView: React.FC = () => {
  const { user, updateCurrentUser } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+91 94371 82910');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      error('Name and Email cannot be empty.');
      return;
    }
    updateCurrentUser({ name, email, phone });
    success('Profile credentials updated successfully.', 'Profile Saved');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      error('Please enter your current password.');
      return;
    }
    const expected = user?.password || 'password123';
    if (currentPassword !== expected) {
      error('Current password does not match.');
      return;
    }
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('New password and confirmation do not match.');
      return;
    }

    updateCurrentUser({ password: newPassword });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    success('Password updated successfully. Use your new password on subsequent logins.', 'Security Updated');
  };

  const roleTitle =
    user?.role === 'admin'
      ? 'Head of Department / System Administrator'
      : user?.role === 'faculty'
      ? 'Faculty Member & Course Instructor'
      : 'Registered Department Student';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-blue-900 text-white font-bold text-2xl flex items-center justify-center shrink-0 border-4 border-blue-100 shadow-xs">
          {user?.name ? user.name.charAt(0) : 'U'}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200">
              {user?.role}
            </span>
          </div>

          <p className="text-xs text-blue-700 font-semibold">{roleTitle}</p>
          <p className="text-xs text-slate-500 mt-1">
            {user?.departmentName || 'Department of Computer Science & Engineering'} · C.V. Raman Global University
          </p>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center sm:justify-start gap-6 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-mono">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email}</span>
            </span>
            <span className="flex items-center gap-1.5 font-mono">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{phone}</span>
            </span>
            <span className="flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>ID: {user?.username}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Edit Information Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Contact */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <UserCircle2 className="w-4 h-4 text-blue-600" />
            <span>Update Contact Details</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Contact Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>Security & Password</span>
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
