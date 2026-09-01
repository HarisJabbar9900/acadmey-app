import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Inbox, 
  Trash2, 
  Check, 
  Clock, 
  User, 
  Sparkles, 
  Lock, 
  Lightbulb, 
  BookOpen, 
  Calendar, 
  Building2,
  Filter
} from 'lucide-react';

export default function StudentFeedback({ 
  data, 
  isAdminLoggedIn, 
  onAddFeedback, 
  onDeleteFeedback, 
  onToggleFeedbackStatus 
}) {
  // Student form state
  const [studentName, setStudentName] = useState('');
  const [selectedClass, setSelectedClass] = useState(() => data.classes?.[0]?.name || '9th');
  const [category, setCategory] = useState('General Suggestion');
  const [comment, setComment] = useState('');

  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Pending' | 'Resolved'
  const [classFilter, setClassFilter] = useState('ALL');
  const [successMessage, setSuccessMessage] = useState('');

  const feedbacksList = data.feedbacks || [];

  // Helper to format class name cleanly (handles '9th', 'Class 9th', 'cls-9th')
  const getDisplayClassName = (classNameOrId) => {
    if (!classNameOrId) return 'General';
    const matchedClass = data.classes?.find(c => c.id === classNameOrId || c.name === classNameOrId);
    if (matchedClass) {
      const cleanName = matchedClass.name.replace(/^Class\s+/i, '');
      return `Class ${cleanName}`;
    }
    const str = String(classNameOrId).trim();
    if (str.toLowerCase().startsWith('class')) {
      return str;
    }
    const cleaned = str.replace(/^cls-/i, '');
    return `Class ${cleaned}`;
  };

  // Submit Student Feedback
  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!studentName.trim() || !comment.trim()) return;

    const newFeedback = {
      id: `fb-${Date.now()}`,
      studentName: studentName.trim(),
      className: selectedClass,
      category,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };

    onAddFeedback(newFeedback);

    // Reset Form
    setStudentName('');
    setComment('');

    // Show Success Toast Notification requested by user!
    setSuccessMessage('✅ Shukriya! Aap ka comment / suggestion Admin ko submit ho gaya hai!');
    setTimeout(() => setSuccessMessage(''), 6000);
  };

  // Filter feedbacks for Admin Inbox
  const filteredFeedbacks = feedbacksList.filter(fb => {
    const matchesStatus = statusFilter === 'ALL' || fb.status === statusFilter;
    const matchesClass = classFilter === 'ALL' || getDisplayClassName(fb.className) === getDisplayClassName(classFilter);
    return matchesStatus && matchesClass;
  });

  const categoryIcons = {
    'General Suggestion': Lightbulb,
    'Study Material': BookOpen,
    'Timetable': Calendar,
    'Facility': Building2
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="glass-panel glow-accent-indigo p-6 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-500 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Al-Zia Science Academy Feedback Corner
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            Student Suggestions & Feedback
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit your valuable suggestions, requests for study material, or feedback directly to the Academy Admin.
          </p>
        </div>

        {isAdminLoggedIn && (
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-4 py-2 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 font-bold font-mono shadow-xs">
            <Inbox className="w-4 h-4" />
            <span>Admin Inbox: {feedbacksList.length} Messages</span>
          </div>
        )}
      </div>

      {/* Success Toast Notification */}
      {successMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 px-6 py-4 rounded-2xl flex items-center justify-between shadow-2xl shadow-emerald-950/50 animate-pulse">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-extrabold text-sm">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 font-bold">✕</button>
        </div>
      )}

      {/* Public Student Feedback Submission Form */}
      <div className="glass-panel glow-accent-indigo p-6 rounded-2xl shadow-xl space-y-4">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-500 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Direct Communication
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            Send Feedback, Inquiries & Notes to Admin
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Have a suggestion or request? Type your message below. (Your message is only visible to Admin).
          </p>
        </div>

        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Student Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Name *</label>
              <input
                type="text"
                required
                placeholder="Enter your name..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium shadow-xs"
              />
            </div>

            {/* Class Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Class *</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
              >
                {data.classes.map(c => {
                  const cleanName = c.name.replace(/^Class\s+/i, '');
                  return (
                    <option key={c.id} value={cleanName} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      Class {cleanName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Topic / Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
              >
                <option value="General Suggestion" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">💡 General Suggestion</option>
                <option value="Study Material" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">📚 Study Material Request</option>
                <option value="Timetable" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">⏰ Timetable / Schedule</option>
                <option value="Facility" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">🏫 Facility / Other</option>
              </select>
            </div>

          </div>

          {/* Comment / Suggestion Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Comment / Suggestion *</label>
            <textarea
              required
              rows="3"
              placeholder="Type your comment or suggestion here for the Admin..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" /> Submit Suggestion
            </button>
          </div>
        </form>
      </div>

      {/* Admin Feedback Inbox (Visible ONLY to Logged-in Admin) */}
      {isAdminLoggedIn ? (
        <div className="glass-panel p-6 rounded-2xl shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-indigo-500 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Inbox className="w-4 h-4" /> Admin Only Section
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                📥 Received Student Comments & Suggestions
              </h3>
            </div>

            {/* Filters: Class and Status */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Class Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setClassFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    classFilter === 'ALL'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  All
                </button>
                {data.classes.map(c => {
                  const cleanName = c.name.replace(/^Class\s+/i, '');
                  return (
                    <button
                      key={c.id}
                      onClick={() => setClassFilter(cleanName)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        classFilter === cleanName
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cleanName}
                    </button>
                  );
                })}
              </div>

              {/* Status Filter */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
                {['ALL', 'Pending', 'Resolved'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map(fb => {
                const IconComp = categoryIcons[fb.category] || Lightbulb;
                const isResolved = fb.status === 'Resolved';

                return (
                  <div
                    key={fb.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                      isResolved
                        ? 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80 shadow-xs'
                        : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-indigo-500/30 hover:border-indigo-500/60 shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-600 text-indigo-700 dark:text-white border border-indigo-200 dark:border-indigo-600 shadow-xs">
                            {getDisplayClassName(fb.className)}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-xs">
                            <IconComp className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> {fb.category}
                          </span>
                        </div>

                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                          isResolved 
                            ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20'
                            : 'bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-500/20'
                        }`}>
                          {fb.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> {fb.studentName}
                        </h4>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 italic">
                          "{fb.comment}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {fb.date}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onToggleFeedbackStatus(fb.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            isResolved
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
                              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                          }`}
                        >
                          <Check className="w-3 h-3" /> {isResolved ? 'Mark Pending' : 'Mark Resolved'}
                        </button>
                        
                        <button
                          onClick={() => onDeleteFeedback(fb.id)}
                          className="p-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all cursor-pointer shadow-xs"
                          title="Delete Suggestion"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-8 text-center text-slate-500 text-xs italic">
                No student comments or suggestions found.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl text-center text-slate-500 text-xs flex items-center justify-center gap-2 font-mono shadow-xs">
          <Lock className="w-4 h-4 text-slate-600" />
          <span>Received suggestions list is confidential and only accessible to Academy Admin.</span>
        </div>
      )}

    </div>
  );
}
