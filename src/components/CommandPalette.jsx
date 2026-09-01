import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  User, 
  GraduationCap, 
  CreditCard, 
  Award, 
  ClipboardCheck, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  CornerDownLeft, 
  X,
  Phone,
  ShieldCheck
} from 'lucide-react';

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  data, 
  onNavigateTab, 
  onSelectClass,
  isAdminLoggedIn,
  onOpenLoginModal
}) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL'); // 'ALL' | 'STUDENTS' | 'PAGES' | 'CLASSES'
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveCategory('ALL');
      setSelectedIndex(0);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);

  // Pages definitions
  const pagesList = useMemo(() => [
    { id: 'dashboard', title: 'Dashboard Overview', subtitle: 'Wall of Honor, Notice Board & Summary', icon: Layers, tab: 'dashboard' },
    { id: 'attendance', title: 'Daily Attendance Register', subtitle: 'Mark and view student presence & WhatsApp alerts', icon: ClipboardCheck, tab: 'attendance' },
    { id: 'fees', title: 'Fee Manager & Vouchers', subtitle: 'Tuition fees, payment ledger & printable receipts', icon: CreditCard, tab: 'fees' },
    { id: 'marks', title: 'Monthly Marks Ledger', subtitle: 'Test scores, merit ranks & report cards', icon: Award, tab: 'marks' },
    { id: 'students', title: 'Student Directory', subtitle: 'Manage student records, admission & details', icon: User, tab: 'students' },
    { id: 'timetable', title: 'Timetable & Class Schedule', subtitle: 'Weekly lectures, teacher & room timings', icon: Calendar, tab: 'timetable' },
    { id: 'material', title: 'Study Material & Notes', subtitle: 'Curriculum PDFs, guides & syllabus', icon: BookOpen, tab: 'material' },
    { id: 'feedback', title: 'Student Feedback & Complaints', subtitle: 'Inquiries, suggestions and reviews', icon: MessageSquare, tab: 'feedback' },
  ], []);

  // Filtered Results
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1. Match Students
    let matchedStudents = (data?.students || []).map(student => {
      const studentClass = (data?.classes || []).find(c => c.id === student.classId);
      return {
        type: 'STUDENT',
        id: `std_${student.id}`,
        student,
        classObj: studentClass,
        title: student.name,
        rollNo: student.rollNo,
        fname: student.fname,
        phone: student.fatherNumber || student.parentContact,
        className: studentClass?.name || 'General',
        icon: User
      };
    });

    if (q) {
      matchedStudents = matchedStudents.filter(item => 
        item.title.toLowerCase().includes(q) ||
        String(item.rollNo).includes(q) ||
        (item.fname && item.fname.toLowerCase().includes(q)) ||
        (item.className && item.className.toLowerCase().includes(q)) ||
        (item.phone && item.phone.includes(q))
      );
    }

    // 2. Match Pages
    let matchedPages = pagesList.map(page => ({
      type: 'PAGE',
      id: `page_${page.id}`,
      page,
      title: page.title,
      subtitle: page.subtitle,
      tab: page.tab,
      icon: page.icon
    }));

    if (q) {
      matchedPages = matchedPages.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.subtitle.toLowerCase().includes(q)
      );
    }

    // 3. Match Classes
    let matchedClasses = (data?.classes || []).map(cls => ({
      type: 'CLASS',
      id: `cls_${cls.id}`,
      classObj: cls,
      title: `Class ${cls.name}`,
      subtitle: `View all students enrolled in Class ${cls.name}`,
      classId: cls.id,
      icon: GraduationCap
    }));

    if (q) {
      matchedClasses = matchedClasses.filter(c => 
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q)
      );
    }

    // Category filtering
    let combined = [];
    if (activeCategory === 'ALL') {
      combined = [...matchedStudents, ...matchedPages, ...matchedClasses];
    } else if (activeCategory === 'STUDENTS') {
      combined = matchedStudents;
    } else if (activeCategory === 'PAGES') {
      combined = matchedPages;
    } else if (activeCategory === 'CLASSES') {
      combined = matchedClasses;
    }

    return {
      all: combined,
      studentsCount: matchedStudents.length,
      pagesCount: matchedPages.length,
      classesCount: matchedClasses.length
    };
  }, [query, data, pagesList, activeCategory]);

  const resultsList = filteredResults.all;

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(resultsList.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + resultsList.length) % Math.max(resultsList.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (resultsList[selectedIndex]) {
        handleExecuteItem(resultsList[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleExecuteItem = (item, specificAction = null) => {
    if (item.type === 'PAGE') {
      onNavigateTab(item.tab);
      onClose();
    } else if (item.type === 'CLASS') {
      onSelectClass(item.classId);
      onNavigateTab('students');
      onClose();
    } else if (item.type === 'STUDENT') {
      if (item.classObj) {
        onSelectClass(item.classObj.id);
      }
      if (specificAction === 'fee') {
        onNavigateTab('fees');
      } else if (specificAction === 'marks') {
        onNavigateTab('marks');
      } else if (specificAction === 'attendance') {
        onNavigateTab('attendance');
      } else {
        onNavigateTab('students');
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 md:p-16 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden glass-panel flex flex-col max-h-[85vh] my-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        
        {/* 1. Search Bar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/90 relative">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search student, roll #, class, fees, marks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-slate-400 text-base font-medium focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-[11px] font-mono text-slate-400 select-none">
            ESC
          </span>
        </div>

        {/* 2. Category Filter Pills */}
        <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Results', count: resultsList.length },
            { id: 'STUDENTS', label: 'Students', count: filteredResults.studentsCount },
            { id: 'PAGES', label: 'Pages & Tools', count: filteredResults.pagesCount },
            { id: 'CLASSES', label: 'Classes', count: filteredResults.classesCount },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeCategory === cat.id ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-700 text-slate-300'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* 3. Results List Container */}
        <div 
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40 no-scrollbar max-h-96"
        >
          {resultsList.length > 0 ? (
            resultsList.map((item, index) => {
              const isSelected = selectedIndex === index;
              const IconComponent = item.icon;

              if (item.type === 'STUDENT') {
                return (
                  <div
                    key={item.id}
                    onClick={() => handleExecuteItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-600/20 border border-indigo-500/40 shadow-md'
                        : 'hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                          : 'bg-slate-800 text-indigo-400 border border-slate-700'
                      }`}>
                        <User className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-white">{item.title}</span>
                          <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                            #{item.rollNo}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                            Class {item.className}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Father: {item.fname || 'N/A'}</span>
                          {item.phone && (
                            <span className="font-mono text-[11px] text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {item.phone}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Quick Action Buttons for Student */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleExecuteItem(item, 'fee'); }}
                        className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="View Fee Record"
                      >
                        <CreditCard className="w-3 h-3" /> Fee
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleExecuteItem(item, 'marks'); }}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="View Marks Ledger & Report Card"
                      >
                        <Award className="w-3 h-3" /> Marks
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleExecuteItem(item, 'attendance'); }}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="View Attendance Sheet"
                      >
                        <ClipboardCheck className="w-3 h-3" /> Attendance
                      </button>
                    </div>
                  </div>
                );
              }

              if (item.type === 'PAGE') {
                return (
                  <div
                    key={item.id}
                    onClick={() => handleExecuteItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-600/20 border border-indigo-500/40 shadow-md'
                        : 'hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                          : 'bg-slate-800 text-indigo-400 border border-slate-700'
                      }`}>
                        <IconComponent className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-white block">{item.title}</span>
                        <span className="text-xs text-slate-400 block">{item.subtitle}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                      <span>Jump to Page</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                  </div>
                );
              }

              if (item.type === 'CLASS') {
                return (
                  <div
                    key={item.id}
                    onClick={() => handleExecuteItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-600/20 border border-indigo-500/40 shadow-md'
                        : 'hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                          : 'bg-slate-800 text-indigo-400 border border-slate-700'
                      }`}>
                        <GraduationCap className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-white block">{item.title}</span>
                        <span className="text-xs text-slate-400 block">{item.subtitle}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                      <span>Filter Roster</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                  </div>
                );
              }

              return null;
            })
          ) : (
            <div className="py-12 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">No matching results found</p>
              <p className="text-xs text-slate-500">
                Try searching with student name (e.g. "Ali"), Roll # (e.g. "101"), or page name (e.g. "Fee").
              </p>
            </div>
          )}
        </div>

        {/* 4. Footer Quick Tips */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">↑</span>
              <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">↓</span>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">↵</span>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">ESC</span>
              <span>Close</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-indigo-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Al-Zia Quick Navigator</span>
          </div>
        </div>

      </div>
    </div>
  );
}
