import React, { useState, useMemo } from 'react';
import { 
  Megaphone, 
  Plus, 
  Bell, 
  Pin, 
  Trash2, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  X, 
  CheckCircle2, 
  ShieldAlert,
  Share2,
  Copy,
  Check,
  Printer,
  Sparkles,
  BookOpen,
  Clock,
  Award,
  GraduationCap,
  ArrowRight,
  Layers,
  Search,
  Filter,
  CheckCheck,
  Send
} from 'lucide-react';

const JAMEEL_FONT = { 
  fontFamily: "'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Kasheeda', 'Noto Nastaliq Urdu', 'Urdu Typesetting', Tahoma, serif" 
};

// Helper: check if string contains Urdu characters
const isUrduText = (text) => {
  if (!text) return false;
  return /[\u0600-\u06FF]/.test(text);
};

export default function NoticeBoard({ data, isAdminLoggedIn, onAddNotice, onDeleteNotice }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Exam Notice');
  const [targetClass, setTargetClass] = useState('All Classes');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  
  // Filtering & Search
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const noticesList = Array.isArray(data?.notices) ? data.notices : [];

  // Helper: Check if notice was created recently (last 24 hours)
  const isNoticeRecent = (notice) => {
    if (!notice) return false;
    const DAY_MS = 86400000;
    const now = Date.now();
    let postTime = notice.createdAt;

    if (!postTime && notice.id && typeof notice.id === 'string' && notice.id.startsWith('ntc-')) {
      const parsed = parseInt(notice.id.replace('ntc-', ''), 10);
      if (!isNaN(parsed) && parsed > 1000000000000) {
        postTime = parsed;
      }
    }

    if (!postTime) return false;
    return (now - postTime) < DAY_MS && (now - postTime) >= 0;
  };

  // Filtered list based on category & search
  const filteredNotices = useMemo(() => {
    return noticesList.filter(n => {
      if (!n) return false;
      const matchesCategory = 
        activeTab === 'ALL' ? true :
        activeTab === 'EXAM' ? n.category === 'Exam Notice' :
        activeTab === 'URGENT' ? n.category === 'Urgent Alert' :
        activeTab === 'HOLIDAY' ? n.category === 'Holiday Notice' : true;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ? true : (
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q)) ||
        (n.targetClass && n.targetClass.toLowerCase().includes(q)) ||
        (n.category && n.category.toLowerCase().includes(q))
      );

      return matchesCategory && matchesSearch;
    });
  }, [noticesList, activeTab, searchQuery]);

  // Separate pinned grand announcements from regular announcements
  const pinnedAnnouncements = filteredNotices.filter(n => n.isPinned);
  const regularAnnouncements = filteredNotices.filter(n => !n.isPinned);

  const handleCreateNotice = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const dateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

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

  const handleCopyNotice = (notice) => {
    let textToCopy = `📢 *AL-ZIA SCIENCE ACADEMY*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🏛️ *الضیاء سائنس اکیڈمی*\n` +
      `📌 *عنوان:* ${notice.title}\n` +
      `🎯 *کلاس / Target:* ${notice.targetClass || 'All Classes'}\n` +
      `📅 *تاریخ:* ${notice.date || 'Active'}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (notice.urduLead) {
      textToCopy += `${notice.urduLead}\n\n`;
    }

    if (Array.isArray(notice.instructions) && notice.instructions.length > 0) {
      textToCopy += `📌 *اہم ہدایات:*\n`;
      notice.instructions.forEach((inst, i) => {
        textToCopy += `${i + 1}. *${inst.title}:* ${inst.text}\n`;
      });
      textToCopy += `\n`;
    }

    if (notice.englishNote) {
      textToCopy += `*English Summary:*\n${notice.englishNote}\n\n`;
    }

    if (notice.content && !notice.urduLead) {
      textToCopy += `${notice.content}\n\n`;
    }

    textToCopy += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `پرنسپل و انتظامیہ الضیاء سائنس اکیڈمی`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(notice.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePrintNotice = (notice) => {
    const oldTitle = document.title;
    document.title = `Official_Notice_${(notice.title || 'Notice').replace(/\s+/g, '_')}`;
    window.print();
    setTimeout(() => { document.title = oldTitle; }, 1000);
  };

  const getCategoryBadgeClass = (cat) => {
    switch (cat) {
      case 'Urgent Alert':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30';
      case 'Exam Notice':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30';
      case 'Holiday Notice':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30';
    }
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm mb-6 space-y-6 overflow-hidden">
      
      {/* 1. TOP HEADER: Institutional Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        
        {/* Left: Emblem & Institutional Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs shrink-0">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Notice Board & Announcements
              </h2>
              <span 
                style={JAMEEL_FONT} 
                className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30"
              >
                نوٹس بورڈ
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Latest academy updates, monthly test schedules, and important notifications.
            </p>
          </div>
        </div>

        {/* Right: Actions & Add Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-52 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all shadow-2xs"
            />
          </div>

          {isAdminLoggedIn && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Notice</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. FILTER TABS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {[
          { key: 'ALL', label: 'All Notices (تمام نوٹسز)' },
          { key: 'EXAM', label: 'Exam Notices (امتحانی نوٹس)' },
          { key: 'URGENT', label: 'Urgent Alerts (ضروری الرٹس)' },
          { key: 'HOLIDAY', label: 'Holidays (تعطیلات)' }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === tab.key
                ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/25 font-black'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. PINNED ANNOUNCEMENTS */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-4">
          {pinnedAnnouncements.map((notice) => {
            const isRecent = isNoticeRecent(notice);
            const isCopied = copiedId === notice.id;

            return (
              <div 
                key={notice.id}
                className="relative rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/5 via-white dark:via-slate-900 to-amber-500/10 p-5 sm:p-7 shadow-xl shadow-amber-500/5 overflow-hidden transition-all"
              >
                {/* Ambient Top Glow Line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

                {/* Subtle Background Watermark */}
                <div className="absolute right-4 bottom-2 pointer-events-none opacity-[0.03] dark:opacity-[0.05] select-none flex items-center justify-center">
                  <GraduationCap className="w-80 h-80 text-amber-900 dark:text-amber-400" />
                </div>

                <div className="relative z-10 space-y-5">
                  
                  {/* Header Ribbon */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-500/20">
                    <div className="flex flex-wrap items-center gap-2">
                      {isRecent && (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-600/30 flex items-center gap-1.5 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-white inline-block animate-ping" />
                          <span>NEW ANNOUNCEMENT</span>
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-lg text-xs font-black bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>PINNED • اہم نوٹس</span>
                      </span>
                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                        {notice.targetClass || 'All Classes'}
                      </span>
                    </div>

                    {/* Action Bar (WhatsApp Copy + Print + Delete) */}
                    <div className="flex items-center gap-2 self-end sm:self-auto print:hidden">
                      <button
                        type="button"
                        onClick={() => handleCopyNotice(notice)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                          isCopied
                            ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        }`}
                        title="Copy announcement for WhatsApp"
                      >
                        {isCopied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied! ✓' : 'Copy for WhatsApp'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePrintNotice(notice)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Print Official Circular"
                      >
                        <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Print</span>
                      </button>

                      {isAdminLoggedIn && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove announcement "${notice.title}"?`)) {
                              onDeleteNotice(notice.id);
                            }
                          }}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-xl transition-all cursor-pointer shadow-xs"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Urdu Main Title & Headline (Beautiful Jameel Noori Nastaleeq) */}
                  <div className="space-y-2 text-right" dir="rtl">
                    <h3 
                      style={JAMEEL_FONT} 
                      className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-amber-400 leading-[2.2] tracking-normal"
                    >
                      {notice.title}
                    </h3>
                    
                    {notice.englishTitle && (
                      <p className="text-xs sm:text-sm font-sans font-bold text-slate-600 dark:text-slate-300 tracking-wide text-left" dir="ltr">
                        {notice.englishTitle}
                      </p>
                    )}
                  </div>

                  {/* Urdu Lead Statement (Jameel Noori Nastaleeq) */}
                  <div 
                    dir="rtl" 
                    style={JAMEEL_FONT} 
                    className="text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-[2.4] text-right bg-amber-500/10 dark:bg-amber-500/5 p-4 sm:p-5 rounded-2xl border border-amber-500/20"
                  >
                    {notice.urduLead || notice.content}
                  </div>

                  {/* Highlighted Directives / Instructions Grid (Urdu Cards in Jameel Noori) */}
                  {Array.isArray(notice.instructions) && notice.instructions.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between" dir="rtl">
                        <span 
                          style={JAMEEL_FONT} 
                          className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5"
                        >
                          📌 اہم ہدایات و ضوابط برائے طلباء:
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-bold">Session Rules</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {notice.instructions.map((inst, idx) => (
                          <div 
                            key={idx}
                            dir="rtl"
                            className="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-xs space-y-2 flex flex-col justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center justify-center font-mono">
                                {idx + 1}
                              </span>
                              <h4 
                                style={JAMEEL_FONT} 
                                className="font-bold text-sm sm:text-base text-slate-900 dark:text-white"
                              >
                                {inst.title}
                              </h4>
                            </div>
                            <p 
                              style={JAMEEL_FONT} 
                              className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-[2.2]"
                            >
                              {inst.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bilingual English Circular Note */}
                  {notice.englishNote && (
                    <div className="bg-slate-100/90 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 sm:p-4 text-xs font-sans text-slate-700 dark:text-slate-300 flex items-start gap-3">
                      <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block uppercase text-[10px] tracking-wider mb-0.5">
                          English Note:
                        </span>
                        <p className="leading-relaxed font-medium">
                          {notice.englishNote}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Authority Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-amber-500/20 text-xs">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>Issued: {notice.date || '18 September 2026'}</span>
                      </span>
                      {notice.startDate && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold">
                          Testing Commences: {notice.startDate}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto" dir="rtl">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      <span 
                        style={JAMEEL_FONT} 
                        className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300"
                      >
                        پرنسپل و انتظامیہ الضیاء سائنس اکیڈمی
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. REGULAR ANNOUNCEMENTS LIST */}
      {regularAnnouncements.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>Other Notices & Updates ({regularAnnouncements.length})</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regularAnnouncements.map((notice) => {
              const isRecent = isNoticeRecent(notice);
              const isCopied = copiedId === notice.id;
              const hasUrdu = isUrduText(notice.title) || isUrduText(notice.content);

              return (
                <div 
                  key={notice.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    {/* Header Pills */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {isRecent && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500 text-white">
                            NEW
                          </span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border ${getCategoryBadgeClass(notice.category)}`}>
                          {notice.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {notice.targetClass}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyNotice(notice)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                          title="Copy notice"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        {isAdminLoggedIn && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete notice "${notice.title}"?`)) {
                                onDeleteNotice(notice.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notice Title */}
                    <h5 
                      style={hasUrdu ? JAMEEL_FONT : undefined} 
                      dir={hasUrdu ? 'rtl' : 'ltr'}
                      className={`text-base font-bold text-slate-900 dark:text-white tracking-tight ${hasUrdu ? 'leading-[2.2] text-right' : ''}`}
                    >
                      {notice.title}
                    </h5>

                    {/* Notice Content */}
                    <p 
                      style={hasUrdu ? JAMEEL_FONT : undefined} 
                      dir={hasUrdu ? 'rtl' : 'ltr'}
                      className={`text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 whitespace-pre-line ${hasUrdu ? 'leading-[2.3] text-right' : ''}`}
                    >
                      {notice.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-500" /> {notice.date}
                    </span>
                    <span className="font-semibold text-slate-500">Al-Zia Academy</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredNotices.length === 0 && (
        <div className="py-12 px-4 text-center flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/40">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 border border-amber-500/20">
            <Megaphone className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">No Announcements Found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
            {searchQuery ? `No notices matching "${searchQuery}".` : 'No notices in this category yet.'}
          </p>
          {isAdminLoggedIn && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Post First Announcement
            </button>
          )}
        </div>
      )}

      {/* 5. ADMIN POST ANNOUNCEMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-auto text-slate-900 dark:text-white">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Publish Announcement</h3>
                  <p 
                    style={JAMEEL_FONT} 
                    className="text-xs text-amber-600 dark:text-amber-400 font-bold"
                  >
                    نیا نوٹس جاری کریں
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Title (اردو یا انگریزی عنوان) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. یکم اکتوبر سے تمام کلاسز کے ٹیسٹ کا آغاز..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={isUrduText(title) ? JAMEEL_FONT : undefined}
                  dir={isUrduText(title) ? 'rtl' : 'ltr'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Exam Notice">📝 Exam Notice (امتحانی نوٹس)</option>
                    <option value="Urgent Alert">🚨 Urgent Alert (ضروری الرٹ)</option>
                    <option value="Holiday Notice">🏖️ Holiday Notice (چھٹی کا اعلان)</option>
                    <option value="General Info">ℹ️ General Info (عمومی معلومات)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Class</label>
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="All Classes">All Classes (تمام کلاسز)</option>
                    {(data?.classes || []).map(c => (
                      <option key={c.id} value={`Class ${c.name}`}>Class {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Details (تفصیلات برائے طلباء و والدین) *
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="تمام طلباء و طالبات کو مطلع کیا جاتا ہے کہ..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={isUrduText(content) ? JAMEEL_FONT : undefined}
                  dir={isUrduText(content) ? 'rtl' : 'ltr'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Live Jameel Noori Nastaleeq Preview if Urdu is typed */}
              {(isUrduText(title) || isUrduText(content)) && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl space-y-1 text-right" dir="rtl">
                  <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 block" dir="ltr">
                    LIVE JAMEEL NOORI NASTALEEQ PREVIEW (پیش نظارہ)
                  </span>
                  <h4 style={JAMEEL_FONT} className="text-base font-bold text-amber-600 dark:text-amber-400">
                    {title || 'عنوان یہاں نظر آئے گا'}
                  </h4>
                  <p style={JAMEEL_FONT} className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-[2.2]">
                    {content || 'تفصیلات یہاں جمیل نوری نستعلیق خط میں ظاہر ہوں گی۔'}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pin-check-new"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="pin-check-new" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pin as Official Grand Circular at top (سب سے اوپر پن کریں) ⭐</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  Publish Announcement (شائع کریں)
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
