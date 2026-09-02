import React, { useState } from 'react';
import { Megaphone, Plus, Bell, Pin, Trash2, Calendar, AlertTriangle, FileText, X, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function NoticeBoard({ data, isAdminLoggedIn, onAddNotice, onDeleteNotice }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Exam Notice');
  const [targetClass, setTargetClass] = useState('All Classes');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const noticesList = Array.isArray(data?.notices) ? data.notices : [];

  // Helper: Check if notice was created within the last 4 hours (4 * 60 * 60 * 1000 = 14,400,000 ms)
  const isNoticeRecent = (notice) => {
    if (!notice) return false;
    const FOUR_HOURS_MS = 14400000;
    const now = Date.now();
    let postTime = notice.createdAt;

    if (!postTime && notice.id && typeof notice.id === 'string' && notice.id.startsWith('ntc-')) {
      const parsed = parseInt(notice.id.replace('ntc-', ''), 10);
      if (!isNaN(parsed) && parsed > 1000000000000) {
        postTime = parsed;
      }
    }

    if (!postTime) return false;
    return (now - postTime) < FOUR_HOURS_MS && (now - postTime) >= 0;
  };

  const handleCreateNotice = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const dateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' });

    const newNotice = {
      id: `ntc-${Date.now()}`,
      createdAt: Date.now(),
      title: title.trim(),
      category,
      targetClass,
      content: content.trim(),
      date: dateStr,
      isPinned
    };

    onAddNotice(newNotice);

    // Reset Form
    setTitle('');
    setContent('');
    setIsPinned(false);
    setIsModalOpen(false);
  };

  const getCategoryBadgeClass = (cat) => {
    switch (cat) {
      case 'Urgent Alert':
        return 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40 animate-pulse';
      case 'Exam Notice':
        return 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/40';
      case 'Holiday Notice':
        return 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40';
      default:
        return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40';
    }
  };

  return (
    <div className="glass-panel glow-accent-indigo rounded-2xl p-5 shadow-xl mb-6 space-y-4 overflow-hidden">
      
      {/* Notice Board Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl animate-bounce">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Al-Zia Science Academy Notice Board & Announcements
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest academy updates, exam schedules, and holiday announcements.
            </p>
          </div>
        </div>

        {isAdminLoggedIn && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Post New Announcement
          </button>
        )}
      </div>

      {/* Notice Cards List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {noticesList.length > 0 ? (
          noticesList.map(notice => {
            const isRecent = isNoticeRecent(notice);
            return (
              <div
                key={notice.id}
                className={`p-4 rounded-xl border transition-all relative flex flex-col justify-between space-y-3 ${
                  isRecent
                    ? 'bg-white dark:bg-slate-900 border-rose-500/60 shadow-md ring-2 ring-rose-500/40'
                    : notice.isPinned
                    ? 'bg-white dark:bg-slate-900 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {isRecent && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-r from-rose-500 to-amber-500 text-white border border-rose-400 shadow-md shadow-rose-500/30 animate-pulse flex items-center gap-1">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                          </span>
                          NEW 🚨
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${getCategoryBadgeClass(notice.category)}`}>
                        {notice.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-slate-700">
                        {notice.targetClass}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {notice.isPinned && (
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-0.5 bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/20">
                          <Pin className="w-3 h-3 fill-amber-500" /> Pinned
                        </span>
                      )}
                      {isAdminLoggedIn && (
                        <button
                          onClick={() => onDeleteNotice(notice.id)}
                          className="p-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                          title="Delete Announcement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight mb-1">
                  {notice.title}
                </h4>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                  {notice.content}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/80 dark:border-slate-800/60 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> Date: {notice.date}
                </span>
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Al-Zia Administration</span>
              </div>
            </div>
          );
        })
        ) : (
          <div className="col-span-full py-6 text-center text-slate-500 text-xs italic">
            No active notices or announcements at the moment.
          </div>
        )}
      </div>

      {/* Admin Post Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-400" /> Post New Announcement
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Test Series Starting Next Monday..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Notice Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Exam Notice">📝 Exam Notice</option>
                    <option value="Urgent Alert">🚨 Urgent Alert</option>
                    <option value="Holiday Notice">🏖️ Holiday Notice</option>
                    <option value="General Info">ℹ️ General Info</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Class</label>
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="All Classes">All Classes</option>
                    {data.classes.map(c => (
                      <option key={c.id} value={`Class ${c.name}`}>Class {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Announcement Details *</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Type the announcement details here for students and parents..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin-check"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="pin-check" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  Pin to top of notice board ⭐
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20"
                >
                  Publish Announcement
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
