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
  Filter,
  PlusCircle,
  X
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
  const [showAdminCompose, setShowAdminCompose] = useState(false);

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
    if (isAdminLoggedIn) {
      setShowAdminCompose(false);
    }

    setSuccessMessage('✅ شکریہ! آپ کا پیغام ایڈمن کو موصول ہو گیا ہے۔');
    setTimeout(() => setSuccessMessage(''), 5000);
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

  const pendingCount = feedbacksList.filter(f => f.status !== 'Resolved').length;

  return (
    <div className="space-y-5">
      
      {/* 1. Lite Control Header */}
      <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Student Inquiries &amp; Feedback</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <span>{isAdminLoggedIn ? 'Student Inquiries & Inbox' : 'Student Feedback & Suggestions'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isAdminLoggedIn 
              ? 'Review and resolve student queries, notes, and material requests.'
              : 'Send questions, study notes requests, or suggestions directly to Academy Administration.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdminLoggedIn ? (
            <>
              <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold font-mono shadow-xs flex items-center gap-1.5">
                <Inbox className="w-3.5 h-3.5 text-indigo-500" />
                <span>{feedbacksList.length} Total</span>
                {pendingCount > 0 && (
                  <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                    {pendingCount} new
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowAdminCompose(prev => !prev)}
                className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {showAdminCompose ? <X className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                <span>{showAdminCompose ? 'Close Form' : 'Test Submit'}</span>
              </button>
            </>
          ) : (
            <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs">
              <Lock className="w-3.5 h-3.5" />
              <span>Private & Confidential</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 font-bold">✕</button>
        </div>
      )}

      {/* 2. ADMIN INBOX (Prioritized at Top for Logged-In Admin) */}
      {isAdminLoggedIn && (
        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
          
          {/* Inbox Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
            {/* Class Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-indigo-500" /> Class:
              </span>
              <button
                type="button"
                onClick={() => setClassFilter('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  classFilter === 'ALL'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/60'
                }`}
              >
                All Classes
              </button>
              {data.classes.map(c => {
                const cleanName = c.name.replace(/^Class\s+/i, '');
                const isSelected = classFilter === cleanName;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setClassFilter(cleanName)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/60'
                    }`}
                  >
                    Class {cleanName}
                  </button>
                );
              })}
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs shrink-0">
              {['ALL', 'Pending', 'Resolved'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map(fb => {
                const IconComp = categoryIcons[fb.category] || Lightbulb;
                const isResolved = fb.status === 'Resolved';

                return (
                  <div
                    key={fb.id}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 ${
                      isResolved
                        ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800/60 opacity-80 shadow-xs'
                        : 'bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/20">
                            {getDisplayClassName(fb.className)}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-1">
                            <IconComp className="w-3 h-3 text-indigo-500" />
                            <span>{fb.category}</span>
                          </span>
                        </div>

                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          isResolved 
                            ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20'
                            : 'bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-500/20'
                        }`}>
                          {fb.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{fb.studentName}</span>
                        </h4>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                          {fb.comment}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{fb.date}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleFeedbackStatus(fb.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            isResolved
                              ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xs'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>{isResolved ? 'Mark Pending' : 'Resolve'}</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => onDeleteFeedback(fb.id)}
                          className="p-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg transition-all cursor-pointer shadow-xs"
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
              <div className="col-span-full py-8 text-center text-slate-500 text-xs">
                No student comments or inquiries found matching selected filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. STUDENT SUBMISSION FORM (Shown to students or when admin opens compose) */}
      {(!isAdminLoggedIn || showAdminCompose) && (
        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
          <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-500" />
              <span>{isAdminLoggedIn ? 'Submit Test Feedback' : 'Write a Note or Suggestion to Admin'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Your message is directly sent to the Academy administration.
            </p>
          </div>

          <form onSubmit={handleSubmitFeedback} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name..."
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium shadow-xs"
                />
              </div>

              {/* Class Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Class *</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
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
                  className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Message / Suggestion *</label>
              <textarea
                required
                rows="3"
                placeholder="Write your note, question, or request here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Message</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
