import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle2,
  X,
  Send,
  Calendar,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { Notice, NoticeAudience, NoticePriority } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

export const NoticesView: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const role = user?.role || 'student';
  const isAdminOrFaculty = role === 'admin' || role === 'faculty';

  const [notices, setNotices] = useState<Notice[]>([]);
  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deletingNotice, setDeletingNotice] = useState<Notice | null>(null);

  const initialForm: Omit<Notice, 'id'> = {
    title: '',
    content: '',
    postedBy: user?.name || 'Department Administrator',
    postedByRole: role === 'admin' ? 'Head of Department' : 'Faculty Member',
    postedDate: new Date().toISOString().substring(0, 10),
    targetAudience: 'All',
    priority: 'normal',
    status: 'published',
  };
  const [formData, setFormData] = useState<Omit<Notice, 'id'>>(initialForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setNotices(StorageService.getNotices());
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      error('Notice title and content cannot be empty.');
      return;
    }
    StorageService.addNotice(formData);
    loadData();
    setIsAddModalOpen(false);
    setFormData(initialForm);
    success('Notice published to department portal successfully.', 'Notice Created');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice) return;
    StorageService.updateNotice(editingNotice);
    loadData();
    setEditingNotice(null);
    success('Notice updated successfully.', 'Notice Saved');
  };

  const handleDeleteConfirm = () => {
    if (!deletingNotice) return;
    StorageService.deleteNotice(deletingNotice.id);
    loadData();
    setDeletingNotice(null);
    success('Notice deleted from circular board.');
  };

  const filteredNotices = notices.filter((n) => {
    // If student, hide drafts and notices not intended for students
    if (role === 'student') {
      if (n.status === 'draft') return false;
      if (n.targetAudience === 'Faculty') return false;
    }

    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.postedBy.toLowerCase().includes(search.toLowerCase());

    const matchesAudience = audienceFilter === 'all' || n.targetAudience === audienceFilter;
    const matchesPriority = priorityFilter === 'all' || n.priority === priorityFilter;

    return matchesSearch && matchesAudience && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Department Notices & Circular Board
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official announcements, academic schedules, compliance circulars, and event notifications.
          </p>
        </div>

        {isAdminOrFaculty && (
          <button
            onClick={() => {
              setFormData({
                ...initialForm,
                postedBy: user?.name || 'Administrator',
              });
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Notice</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search circulars by keyword..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div>
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Target Audiences</option>
            <option value="All">General (Everyone)</option>
            <option value="Students">Students Only</option>
            <option value="Faculty">Faculty Only</option>
          </select>
        </div>

        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent Circulars</option>
            <option value="high">High Priority</option>
            <option value="normal">Normal Bulletins</option>
          </select>
        </div>
      </div>

      {/* Notices Feed List */}
      <div className="space-y-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => {
            const isUrgent = notice.priority === 'urgent';
            const isHigh = notice.priority === 'high';

            return (
              <div
                key={notice.id}
                className={`p-6 rounded-xl border bg-white shadow-2xs transition-all ${
                  isUrgent
                    ? 'border-rose-300 bg-rose-50/20'
                    : isHigh
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {isUrgent && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-sm border border-rose-300">
                        URGENT
                      </span>
                    )}
                    {isHigh && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-sm border border-amber-300">
                        HIGH PRIORITY
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-mono tabular-nums">
                      {notice.postedDate}
                    </span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs font-semibold text-blue-700">
                      Audience: {notice.targetAudience}
                    </span>
                    {notice.status === 'draft' && (
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-300">
                        DRAFT
                      </span>
                    )}
                  </div>

                  {isAdminOrFaculty && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingNotice(notice)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                        title="Edit Notice"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingNotice(notice)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{notice.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {notice.content}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {notice.postedBy} ({notice.postedByRole})
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Official Department Bulletin
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
            <BellRing className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No notices match your filter</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Check back later for updated departmental announcements.
            </p>
          </div>
        )}
      </div>

      {/* Add Notice Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Publish Department Notice</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Circular Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Schedule for Mid-Semester Practical Examination"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAudience: e.target.value as NoticeAudience,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="All">All Department</option>
                    <option value="Students">Students Only</option>
                    <option value="Faculty">Faculty Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as NoticePriority,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'published' | 'draft',
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="published">Publish Now</option>
                    <option value="draft">Save as Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Content *</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Detailed announcement content with instructions and deadlines..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
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
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Notice Modal */}
      {editingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Edit Circular</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingNotice.title}
                  onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={editingNotice.targetAudience}
                    onChange={(e) =>
                      setEditingNotice({
                        ...editingNotice,
                        targetAudience: e.target.value as NoticeAudience,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="All">All Department</option>
                    <option value="Students">Students Only</option>
                    <option value="Faculty">Faculty Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={editingNotice.priority}
                    onChange={(e) =>
                      setEditingNotice({
                        ...editingNotice,
                        priority: e.target.value as NoticePriority,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Content</label>
                <textarea
                  rows={4}
                  value={editingNotice.content}
                  onChange={(e) => setEditingNotice({ ...editingNotice, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingNotice(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingNotice}
        title="Delete Circular"
        message={`Are you sure you want to remove notice "${deletingNotice?.title}"?`}
        confirmLabel="Delete Notice"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingNotice(null)}
      />
    </div>
  );
};
