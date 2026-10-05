import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle2,
  Building,
  GraduationCap,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { SystemSettings } from '../../types';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../common/ConfirmModal';

export const SettingsView: React.FC = () => {
  const { success } = useToast();
  const [settings, setSettings] = useState<SystemSettings>(() => StorageService.getSettings());
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(settings);
    success('System configuration and academic parameters updated successfully.', 'Settings Saved');
  };

  const handleResetData = () => {
    StorageService.resetAll();
    setIsResetConfirmOpen(false);
    success('Institutional database reset to default state. Reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Departmental & Academic Regulations Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure statutory attendance thresholds, grading scales, active academic sessions, and institution metadata.
          </p>
        </div>

        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Sample Data</span>
        </button>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
        <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
          {/* Institutional Info */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>University & Department Identity</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">University Name</label>
                <input
                  type="text"
                  value={settings.universityName}
                  onChange={(e) => setSettings({ ...settings, universityName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  value={settings.departmentName}
                  onChange={(e) => setSettings({ ...settings, departmentName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          {/* Academic Session */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Academic Session & Term Parameters</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={settings.academicYear}
                  onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                  placeholder="e.g. 2026-2027"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Semester Cycle</label>
                <select
                  value={settings.currentSemesterType}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      currentSemesterType: e.target.value as 'Odd' | 'Even',
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="Odd">Odd Semester (Autumn)</option>
                  <option value="Even">Even Semester (Spring)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Statutory Thresholds */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Statutory Examination Regulations</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Minimum Required Attendance (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={settings.minAttendancePercentage}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        minAttendancePercentage: parseInt(e.target.value) || 75,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Students below this percentage trigger automated examination eligibility warnings.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grading Scheme</label>
                <select
                  value={settings.gradingScheme}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      gradingScheme: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="Standard 10-Point">Standard 10-Point CBCS Scale (O, A+, A, B+, B, C, P, F)</option>
                  <option value="Relative Grading">Normalized Relative Grading Curve</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex items-center justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Reset Confirmation */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset All University Data"
        message="This will clear your local alterations and restore default sample students, faculty, timetables, and marks. Proceed?"
        confirmLabel="Reset Data"
        isDestructive={true}
        onConfirm={handleResetData}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
