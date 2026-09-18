import React, { useState, useMemo } from 'react';
import { 
  ClipboardCheck, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Save, 
  UserCheck, 
  AlertCircle,
  Filter,
  MessageCircle,
  Lock,
  Sparkles,
  Copy,
  Check,
  X,
  Send,
  Users,
  BarChart3,
  Printer,
  Search,
  ArrowUpDown,
  Eye,
  AlertTriangle,
  History,
  CalendarDays,
  FileSpreadsheet
} from 'lucide-react';

export default function AttendanceSheet({ data, onSaveAttendance, selectedClassId, isAdminLoggedIn }) {
  // Top-level View Mode: 'daily' | 'summary'
  const [activeView, setActiveView] = useState('daily');

  // --- DAILY VIEW STATE ---
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeClassId, setActiveClassId] = useState(selectedClassId && selectedClassId !== 'ALL' ? selectedClassId : 'ALL');
  const [smsModal, setSmsModal] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [dailyStatusFilter, setDailyStatusFilter] = useState('ALL'); // 'ALL' | 'Present' | 'Absent' | 'Late'

  // --- SUMMARY / HISTORY VIEW STATE ---
  const [summaryRange, setSummaryRange] = useState('last10'); // 'last7' | 'last10' | 'month' | 'last30' | 'custom'
  
  // Date calculation helpers
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getDateNDaysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };
  const getMonthStartStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  };

  const [customStartDate, setCustomStartDate] = useState(() => getDateNDaysAgo(9));
  const [customEndDate, setCustomEndDate] = useState(() => getTodayStr());
  const [summarySearch, setSummarySearch] = useState('');
  const [summarySort, setSummarySort] = useState('absent-desc'); // 'absent-desc' | 'pct-asc' | 'pct-desc' | 'roll-asc' | 'name-asc'
  const [detailModalStudent, setDetailModalStudent] = useState(null);
  const [summarySmsModal, setSummarySmsModal] = useState(null);
  const [isSummaryCopied, setIsSummaryCopied] = useState(false);

  if (!isAdminLoggedIn) {
    return (
      <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 my-8 shadow-2xl">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-500/20 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Daily Attendance Management</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Daily attendance register is restricted and accessible to Admin only. Please click <strong className="text-indigo-600 dark:text-indigo-400">Admin Login</strong> in the top right menu and enter your PIN to mark or view attendance.
        </p>
      </div>
    );
  }

  // Get students for selected class or all students
  const isAllClasses = activeClassId === 'ALL';
  const classStudents = isAllClasses ? (data?.students || []) : (data?.students || []).filter(s => s.classId === activeClassId);
  const currentClass = isAllClasses ? { name: 'All Classes' } : (data?.classes || []).find(c => c.id === activeClassId);

  // Helper to get combined records for selected date in daily mode
  const getCombinedRecords = (date, classId) => {
    if (classId === 'ALL') {
      const combined = {};
      (data?.classes || []).forEach(c => {
        const rec = data?.attendance?.[`${date}_${c.id}`]?.records || {};
        Object.assign(combined, rec);
      });
      return combined;
    }
    return data?.attendance?.[`${date}_${classId}`]?.records || {};
  };

  // Local draft state for attendance in daily mode
  const [records, setRecords] = useState(() => getCombinedRecords(selectedDate, activeClassId));

  // Sync draft state if date or class changes
  React.useEffect(() => {
    setRecords(getCombinedRecords(selectedDate, activeClassId));
  }, [selectedDate, activeClassId, data?.attendance]);

  const handleStatusChange = (studentId, status) => {
    setRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const allPresent = { ...records };
    classStudents.forEach(s => {
      allPresent[s.id] = 'Present';
    });
    setRecords(allPresent);
  };

  const handleSave = () => {
    // Ensure every enrolled student has a full status saved (defaulting to Present if untouched)
    const fullRecords = { ...records };
    classStudents.forEach(s => {
      if (!fullRecords[s.id]) {
        fullRecords[s.id] = 'Present';
      }
    });

    if (activeClassId === 'ALL') {
      (data?.classes || []).forEach(c => {
        const classStudentIds = new Set((data?.students || []).filter(s => s.classId === c.id).map(s => s.id));
        const classSpecificRecords = {};
        Object.entries(fullRecords).forEach(([stdId, status]) => {
          if (classStudentIds.has(stdId)) {
            classSpecificRecords[stdId] = status;
          }
        });
        if (Object.keys(classSpecificRecords).length > 0) {
          onSaveAttendance(selectedDate, c.id, classSpecificRecords);
        }
      });
    } else {
      onSaveAttendance(selectedDate, activeClassId, fullRecords);
    }
    setRecords(fullRecords);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  // Compute live stats for current daily sheet
  const totalCount = classStudents.length;
  const presentCount = classStudents.filter(s => (records[s.id] || 'Present') === 'Present').length;
  const absentCount = classStudents.filter(s => records[s.id] === 'Absent').length;
  const lateCount = classStudents.filter(s => records[s.id] === 'Late').length;

  // Filter students for Daily View according to active status filter (e.g. Absent only)
  const displayedDailyStudents = classStudents.filter(student => {
    const status = records[student.id] || 'Present';
    if (dailyStatusFilter === 'ALL') return true;
    return status === dailyStatusFilter;
  });

  const getAbsentMessage = (student) => {
    const dateObj = new Date(selectedDate);
    const urduMonths = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];
    const day = !isNaN(dateObj) ? dateObj.getDate() : '';
    const monthUrdu = !isNaN(dateObj) ? urduMonths[dateObj.getMonth()] : '';
    const formattedDate = !isNaN(dateObj) ? `${day} ${monthUrdu}` : 'آج';

    const studentClassObj = (data?.classes || []).find(c => c.id === student.classId);
    const studentClassName = studentClassObj ? studentClassObj.name : (currentClass && currentClass.name !== 'All Classes' ? currentClass.name : '');

    const rlm = '\u200F';
    return `🌟 الضیاء سائنس اکیڈمی 🌟\nAl-Zia Science Academy\n\nمحترم والدین!\nالسلام علیکم ورحمۃ اللہ وبرکاتہ،\n\nآپ کو مطلع کیا جاتا ہے کہ آپ کا بچہ/بچی:\n\n👤 نام:${rlm} ${student.name}\n🔢 رول نمبر:${rlm} #${student.rollNo}\n🏫 کلاس:${rlm} ${studentClassName || 'N/A'}\n📅 تاریخ:${rlm} ${formattedDate}\n\nآج الضیاء سائنس اکیڈمی میں غیر حاضر (Absent) رہا/رہی ہے۔\n\nبراہِ کرم اپنے بچے/بچی کی باقاعدہ حاضری کو یقینی بنائیں تاکہ تعلیمی سرگرمیوں میں کسی قسم کا خلل نہ آئے۔\n\nآپ کے تعاون کا شکریہ۔\n\nانتظامیہ\nالضیاء سائنس اکیڈمی\nAl-Zia Science Academy\n+92 334 6683236`;
  };

  const handleOpenSmsPreview = (student) => {
    const parentPhone = student.fatherNumber || student.parentContact;
    if (!parentPhone) {
      alert(`Parent phone number not found for ${student.name}`);
      return;
    }
    let cleanPhone = parentPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '92' + cleanPhone.slice(1);
    }
    const msg = getAbsentMessage(student);
    setIsCopied(false);
    setSmsModal({
      student,
      phone: cleanPhone,
      msg
    });
  };

  const handleSendWhatsApp = (phone, msg) => {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ==========================================
  // 📊 ATTENDANCE SUMMARY & LEAVE LOGIC (CHHUTTIYAN)
  // ==========================================

  // Determine active start & end dates based on selected range preset
  const { startDate, endDate, rangeLabel } = useMemo(() => {
    const today = getTodayStr();
    if (summaryRange === 'last7') {
      return { startDate: getDateNDaysAgo(6), endDate: today, rangeLabel: 'Last 7 Days (پچھلے 7 دن)' };
    }
    if (summaryRange === 'last10') {
      return { startDate: getDateNDaysAgo(9), endDate: today, rangeLabel: 'Last 10 Days (پچھلے 10 دن)' };
    }
    if (summaryRange === 'month') {
      return { startDate: getMonthStartStr(), endDate: today, rangeLabel: 'This Month (موجودہ مہینہ)' };
    }
    if (summaryRange === 'last30') {
      return { startDate: getDateNDaysAgo(29), endDate: today, rangeLabel: 'Last 30 Days (پچھلے 30 دن)' };
    }
    return { 
      startDate: customStartDate || getDateNDaysAgo(9), 
      endDate: customEndDate || today, 
      rangeLabel: `${customStartDate || ''} to ${customEndDate || ''}` 
    };
  }, [summaryRange, customStartDate, customEndDate]);

  // Aggregate attendance entries across data.attendance within [startDate, endDate]
  const { studentSummaries, recordedDaysCount, totalAcademyAbsents, highAbsenteesCount, avgAttendanceRate } = useMemo(() => {
    const attendanceMap = data?.attendance || {};
    const relevantEntries = [];
    const dateSet = new Set();

    Object.entries(attendanceMap).forEach(([key, record]) => {
      const recDate = record?.date || key.split('_')[0];
      const recClassId = record?.classId || key.split('_').slice(1).join('_');
      if (recDate && recDate >= startDate && recDate <= endDate) {
        relevantEntries.push({
          key,
          date: recDate,
          classId: recClassId,
          records: record?.records || {}
        });
        if (activeClassId === 'ALL' || recClassId === activeClassId) {
          dateSet.add(recDate);
        }
      }
    });

    let totalAbsentsAcc = 0;
    let rateSum = 0;
    let rateCount = 0;

    const summaries = classStudents.map(student => {
      let pCount = 0;
      let aCount = 0;
      let lCount = 0;
      const history = [];

      relevantEntries.forEach(entry => {
        if (entry.classId === student.classId) {
          const status = entry.records[student.id];
          if (status) {
            if (status === 'Present') pCount++;
            else if (status === 'Absent') aCount++;
            else if (status === 'Late') lCount++;

            const studentClass = (data?.classes || []).find(c => c.id === student.classId);
            history.push({
              date: entry.date,
              status,
              className: studentClass?.name || ''
            });
          }
        }
      });

      history.sort((a, b) => b.date.localeCompare(a.date));

      const totalMarkedDays = pCount + aCount + lCount;
      const pct = totalMarkedDays > 0 
        ? Math.round(((pCount + (lCount * 0.5)) / totalMarkedDays) * 100)
        : 100;

      totalAbsentsAcc += aCount;
      if (totalMarkedDays > 0) {
        rateSum += pct;
        rateCount++;
      }

      return {
        student,
        totalMarkedDays,
        presentCount: pCount,
        absentCount: aCount,
        lateCount: lCount,
        percentage: pct,
        history
      };
    });

    const avgRate = rateCount > 0 ? Math.round(rateSum / rateCount) : 0;
    const highAbsentees = summaries.filter(s => s.absentCount >= 3).length;

    return {
      studentSummaries: summaries,
      recordedDaysCount: dateSet.size,
      totalAcademyAbsents: totalAbsentsAcc,
      highAbsenteesCount: highAbsentees,
      avgAttendanceRate: avgRate
    };
  }, [data?.attendance, data?.classes, classStudents, activeClassId, startDate, endDate]);

  // Filter & sort summaries
  const filteredAndSortedSummaries = useMemo(() => {
    let result = studentSummaries.filter(item => {
      if (!summarySearch.trim()) return true;
      const q = summarySearch.toLowerCase().trim();
      const name = (item.student.name || '').toLowerCase();
      const fname = (item.student.fname || '').toLowerCase();
      const roll = String(item.student.rollNo || '');
      const phone = (item.student.fatherNumber || item.student.parentContact || '').toLowerCase();
      return name.includes(q) || fname.includes(q) || roll.includes(q) || phone.includes(q);
    });

    result.sort((a, b) => {
      if (summarySort === 'absent-desc') {
        if (b.absentCount !== a.absentCount) return b.absentCount - a.absentCount;
        return a.percentage - b.percentage;
      }
      if (summarySort === 'pct-asc') {
        return a.percentage - b.percentage;
      }
      if (summarySort === 'pct-desc') {
        return b.percentage - a.percentage;
      }
      if (summarySort === 'roll-asc') {
        return Number(a.student.rollNo || 0) - Number(b.student.rollNo || 0);
      }
      if (summarySort === 'name-asc') {
        return (a.student.name || '').localeCompare(b.student.name || '');
      }
      return 0;
    });

    return result;
  }, [studentSummaries, summarySearch, summarySort]);

  // Format absent report WhatsApp message for a student across selected timeframe
  const getStudentSummaryUrduMsg = (summaryItem) => {
    const { student, totalMarkedDays, presentCount, absentCount, lateCount, percentage, history } = summaryItem;
    const studentClassObj = (data?.classes || []).find(c => c.id === student.classId);
    const className = studentClassObj ? studentClassObj.name : 'N/A';

    const absentDatesList = history
      .filter(h => h.status === 'Absent')
      .map(h => `• ${h.date}`)
      .join('\n') || 'کوئی چھٹی نہیں';

    const rlm = '\u200F';
    return `🌟 الضیاء سائنس اکیڈمی 🌟\nAl-Zia Science Academy\n\nمحترم والدین!\nالسلام علیکم ورحمۃ اللہ وبرکاتہ،\n\nآپ کے بچے/بچی کی حاضری رپورٹ برائے دورانیہ (${startDate} تا ${endDate}):\n\n👤 نام:${rlm} ${student.name}\n🔢 رول نمبر:${rlm} #${student.rollNo}\n🏫 کلاس:${rlm} ${className}\n\n📊 حاضری خلاصہ:\n• کل حاضری کے دن: ${totalMarkedDays}\n• حاضر (Present): ${presentCount} دن\n• چھٹیاں (Absent): ${absentCount} دن\n• لیٹ (Late): ${lateCount} دن\n• حاضری فیصد: ${percentage}%\n\n❌ غیر حاضری کی تاریخیں:\n${absentDatesList}\n\nبراہِ کرم بچے کی باقاعدہ حاضری یقینی بنائیں تاکہ تعلیمی عمل متاثر نہ ہو۔\n\nشکریہ۔\nانتظامیہ\nالضیاء سائنس اکیڈمی\n+92 334 6683236`;
  };

  const handleOpenSummarySms = (summaryItem) => {
    const parentPhone = summaryItem.student.fatherNumber || summaryItem.student.parentContact;
    if (!parentPhone) {
      alert(`Parent phone number not found for ${summaryItem.student.name}`);
      return;
    }
    let cleanPhone = parentPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '92' + cleanPhone.slice(1);
    }
    const msg = getStudentSummaryUrduMsg(summaryItem);
    setIsSummaryCopied(false);
    setSummarySmsModal({
      student: summaryItem.student,
      phone: cleanPhone,
      msg
    });
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      
      {/* 🌟 TOP VIEW SWITCHER: Daily Register vs Attendance Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xs">
        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl w-full sm:w-auto border border-slate-200/60 dark:border-slate-700/50">
          <button
            type="button"
            onClick={() => setActiveView('daily')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeView === 'daily'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Daily Roll Call</span>
            <span className="text-xs opacity-90 font-jameel font-bold">روزانہ حاضری</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('summary')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeView === 'summary'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Attendance & Leave Summary</span>
            <span className="text-xs opacity-90 font-jameel font-bold">چھٹیاں و خلاصہ</span>
          </button>
        </div>

        {activeView === 'summary' && (
          <button
            type="button"
            onClick={handlePrintSummary}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Print Attendance Summary Report"
          >
            <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Print Report</span>
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODE 1: DAILY ATTENDANCE REGISTER */}
      {/* ============================================================ */}
      {activeView === 'daily' && (
        <div className="space-y-5 animate-fade-in">
          {/* 1. Control & Class Filter Bar */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            
            {/* Top Row: Info & Action Tools */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-xs shrink-0">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                    Daily Attendance Roll Call
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mark present/absent for each student & send WhatsApp alerts to parents
                  </p>
                </div>
              </div>

              {/* Right Action Tools: Date & Save Buttons */}
              <div className="flex items-center flex-wrap gap-2.5 shrink-0">
                {/* Date Selector */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 shadow-xs">
                  <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleMarkAllPresent}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    title="Mark all displayed students as Present"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Mark All Present</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    title="Save attendance records"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Attendance</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Class Selection Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0 mr-1">
                <Filter className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> Class:
              </span>

              <button
                type="button"
                onClick={() => setActiveClassId('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeClassId === 'ALL'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/60'
                }`}
              >
                <span>All Students</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${activeClassId === 'ALL' ? 'bg-indigo-950/60 text-indigo-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  {data?.students?.length || 0}
                </span>
              </button>

              {(data?.classes || []).map(c => {
                const isSelected = activeClassId === c.id;
                const count = (data?.students || []).filter(s => s.classId === c.id).length;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setActiveClassId(c.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm shadow-indigo-600/30'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/60'
                    }`}
                  >
                    <span>Class {c.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${isSelected ? 'bg-indigo-950/60 text-indigo-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Success Alert */}
          {isSavedAlert && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 p-3.5 rounded-xl flex items-center gap-2.5 text-xs animate-fade-in font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Attendance recorded successfully for <strong>{isAllClasses ? 'All Classes' : `Class ${currentClass?.name}`}</strong> on <strong>{selectedDate}</strong>!</span>
            </div>
          )}

          {/* 2. Distinct Metric Stat Cards (Interactive 1-Click Filters) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Total Students Card */}
            <button
              type="button"
              onClick={() => setDailyStatusFilter('ALL')}
              className={`p-3.5 rounded-2xl shadow-xs flex items-center gap-3 transition-all text-left cursor-pointer border ${
                dailyStatusFilter === 'ALL'
                  ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-500/60 ring-2 ring-indigo-500/30'
                  : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-slate-700'
              }`}
              title="Click to view all students"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Students</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{totalCount}</span>
              </div>
            </button>

            {/* Present Card */}
            <button
              type="button"
              onClick={() => setDailyStatusFilter('Present')}
              className={`p-3.5 rounded-2xl shadow-xs flex items-center gap-3 transition-all text-left cursor-pointer border ${
                dailyStatusFilter === 'Present'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-sm'
                  : 'bg-white/80 dark:bg-slate-900/60 border-emerald-500/20 hover:border-emerald-500/50'
              }`}
              title="Click to view only Present students"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Present</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-300 font-mono">{presentCount}</span>
              </div>
            </button>

            {/* Absent Card (Highlighted 1-Click Absent View) */}
            <button
              type="button"
              onClick={() => setDailyStatusFilter(dailyStatusFilter === 'Absent' ? 'ALL' : 'Absent')}
              className={`p-3.5 rounded-2xl shadow-xs flex items-center gap-3 transition-all text-left cursor-pointer border relative ${
                dailyStatusFilter === 'Absent'
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500/70 ring-2 ring-rose-500/40 shadow-md shadow-rose-500/10 scale-[1.02]'
                  : 'bg-white/80 dark:bg-slate-900/60 border-rose-500/25 hover:border-rose-500/50 hover:bg-rose-50/30'
              }`}
              title="Click to view ONLY Absent students"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Absent Only</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${dailyStatusFilter === 'Absent' ? 'bg-rose-600 text-white animate-pulse' : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'}`}>
                    {dailyStatusFilter === 'Absent' ? 'ACTIVE' : 'VIEW'}
                  </span>
                </div>
                <span className="text-xl font-black text-rose-600 dark:text-rose-300 font-mono">{absentCount}</span>
              </div>
            </button>

            {/* Late Card */}
            <button
              type="button"
              onClick={() => setDailyStatusFilter('Late')}
              className={`p-3.5 rounded-2xl shadow-xs flex items-center gap-3 transition-all text-left cursor-pointer border ${
                dailyStatusFilter === 'Late'
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500/60 ring-2 ring-amber-500/30 shadow-sm'
                  : 'bg-white/80 dark:bg-slate-900/60 border-amber-500/20 hover:border-amber-500/50'
              }`}
              title="Click to view only Late students"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Late</span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-300 font-mono">{lateCount}</span>
              </div>
            </button>
          </div>

          {/* 3. Class Attendance Register Table */}
          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  {isAllClasses ? 'All Students Attendance Roster' : `Class ${currentClass?.name || ''} Attendance Roster`}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md font-mono bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 font-bold">
                  {displayedDailyStudents.length} of {classStudents.length} Students
                </span>

                {/* Filter indicator tag */}
                {dailyStatusFilter !== 'ALL' && (
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 shadow-xs ${
                    dailyStatusFilter === 'Absent'
                      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                      : dailyStatusFilter === 'Present'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  }`}>
                    Filtered: {dailyStatusFilter} Only
                    <button
                      type="button"
                      onClick={() => setDailyStatusFilter('ALL')}
                      className="hover:text-slate-900 dark:hover:text-white text-xs font-black ml-1 cursor-pointer"
                      title="Clear filter and show all"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>

              {/* Status Filter Pill Buttons */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">Filter:</span>
                <button
                  type="button"
                  onClick={() => setDailyStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dailyStatusFilter === 'ALL'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setDailyStatusFilter('Absent')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    dailyStatusFilter === 'Absent'
                      ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/30'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Absent Only ({absentCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDailyStatusFilter('Present')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dailyStatusFilter === 'Present'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Present ({presentCount})
                </button>
                <button
                  type="button"
                  onClick={() => setDailyStatusFilter('Late')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dailyStatusFilter === 'Late'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Late ({lateCount})
                </button>
              </div>
            </div>

            {displayedDailyStudents.length > 0 ? (
              <div className="overflow-x-auto -mx-1 sm:mx-0">
                <table className="w-full text-left text-sm min-w-[620px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                      <th className="py-3.5 px-4 whitespace-nowrap">Roll #</th>
                      {isAllClasses && <th className="py-3.5 px-4 whitespace-nowrap">Class</th>}
                      <th className="py-3.5 px-4 whitespace-nowrap">Student Name</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Father Name</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Father Number</th>
                      <th className="py-3.5 px-4 text-center whitespace-nowrap">Attendance Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60 text-slate-900 dark:text-slate-200">
                    {displayedDailyStudents.map((student) => {
                      const currentStatus = records[student.id] || 'Present';
                      return (
                        <tr key={student.id} className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-xs text-indigo-700 dark:text-indigo-400 font-extrabold whitespace-nowrap">#{student.rollNo}</td>
                          {isAllClasses && (
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
                                Class {(data?.classes || []).find(c => c.id === student.classId)?.name || 'N/A'}
                              </span>
                            </td>
                          )}
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">{student.name}</td>
                          <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">{student.fname || 'N/A'}</td>
                          <td className="py-3.5 px-4 text-xs font-mono whitespace-nowrap">
                            <span className="text-slate-600 dark:text-slate-300">{student.fatherNumber || student.parentContact || 'N/A'}</span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              {/* Present Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'Present')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                                  currentStatus === 'Present'
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                                    : 'bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 border border-slate-200 hover:border-emerald-300 dark:border-slate-700/60 shadow-sm'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Present
                              </button>

                              {/* Absent Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'Absent')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                                  currentStatus === 'Absent'
                                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30 scale-105'
                                    : 'bg-slate-100 hover:bg-rose-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 hover:text-rose-700 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 hover:border-rose-300 dark:border-slate-700/60 shadow-sm'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" /> Absent
                              </button>

                              {/* Late Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'Late')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                                  currentStatus === 'Late'
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/30 scale-105'
                                    : 'bg-slate-100 hover:bg-amber-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 hover:text-amber-700 dark:text-slate-400 dark:hover:text-amber-400 border border-slate-200 hover:border-amber-300 dark:border-slate-700/60 shadow-sm'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" /> Late
                              </button>

                              {/* WhatsApp Parent Alert Button if Absent */}
                              {currentStatus === 'Absent' && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenSmsPreview(student)}
                                  className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                                  title="Open WhatsApp SMS Preview (Jameel Noori Nastaleeq)"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" /> WA Alert
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : classStudents.length > 0 && dailyStatusFilter !== 'ALL' ? (
              <div className="p-12 text-center text-slate-500">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {dailyStatusFilter === 'Absent' ? 'No Absent Students Today' : `No ${dailyStatusFilter} Students`}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  {dailyStatusFilter === 'Absent' 
                    ? `Selected date (${selectedDate}) par ${isAllClasses ? 'sari academy' : `Class ${currentClass?.name || ''}`} ke tamaam students present hain.`
                    : `No students found with status "${dailyStatusFilter}".`}
                </p>
                <button
                  type="button"
                  onClick={() => setDailyStatusFilter('ALL')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" /> Show All Students
                </button>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                No students enrolled in {isAllClasses ? 'the academy' : `Class ${currentClass?.name || ''}`} yet. Go to <strong>Classes & Students</strong> tab to add students.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: ATTENDANCE & LEAVE SUMMARY (CHHUTTIYAN REPORT) */}
      {/* ============================================================ */}
      {activeView === 'summary' && (
        <div className="space-y-5 animate-fade-in" id="attendance-summary-print-area">
          
          {/* Printable Academy Header (visible during print) */}
          <div className="hidden print:block text-center border-b-2 border-indigo-900 pb-4 mb-4">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">🌟 AL-ZIA SCIENCE ACADEMY 🌟</h1>
            <p className="text-sm font-bold text-slate-700">Student Attendance & Leave Register (طلباء حاضری و چھٹیاں رپورٹ)</p>
            <div className="flex justify-between items-center text-xs text-slate-600 mt-2 px-4">
              <span><strong>Class:</strong> {isAllClasses ? 'All Classes' : `Class ${currentClass?.name}`}</span>
              <span><strong>Timeframe:</strong> {rangeLabel}</span>
              <span><strong>Printed on:</strong> {getTodayStr()}</span>
            </div>
          </div>

          {/* 1. Executive Analytics & Filter Control Center */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 print:hidden">
            
            {/* Top Row: Title + Duration Segmented Control + Current Date Pill */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3.5 border-b border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/15 to-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-xs shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Attendance & Leave Analytics
                    </h2>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/20 font-nastaleeq">
                      حاضری و چھٹیاں تجزیہ
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Comprehensive student attendance logs, leave patterns, and consistency tracking
                  </p>
                </div>
              </div>

              {/* Right Side: Sleek Segmented Duration Control */}
              <div className="flex items-center flex-wrap gap-2.5">
                <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
                  {[
                    { id: 'last10', label: 'Last 10 Days' },
                    { id: 'last7', label: '7 Days' },
                    { id: 'month', label: 'This Month' },
                    { id: 'last30', label: '30 Days' },
                    { id: 'custom', label: 'Custom' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSummaryRange(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        summaryRange === tab.id
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Date Range Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>{startDate}</span>
                  <span className="text-slate-400">➔</span>
                  <span>{endDate}</span>
                </div>
              </div>
            </div>

            {/* Custom Date Pickers (Shown only if Custom is selected) */}
            {summaryRange === 'custom' && (
              <div className="flex items-center flex-wrap gap-2.5 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Select Custom Date Range:
                </span>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-400">From:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-400">To:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Middle Row: Clean Class Pills Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0 mr-1">
                <Filter className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Class:
              </span>

              <button
                type="button"
                onClick={() => setActiveClassId('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeClassId === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/60'
                }`}
              >
                <span>All Students</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                  activeClassId === 'ALL' ? 'bg-indigo-950/60 text-indigo-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {data?.students?.length || 0}
                </span>
              </button>

              {(data?.classes || []).map(c => {
                const isSelected = activeClassId === c.id;
                const count = (data?.students || []).filter(s => s.classId === c.id).length;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setActiveClassId(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/60'
                    }`}
                  >
                    <span>Class {c.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                      isSelected ? 'bg-indigo-950/60 text-indigo-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Row: Search Box & Professional Sort Selector */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search student by name, roll #, father name, or contact number..."
                  value={summarySearch}
                  onChange={(e) => setSummarySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
                {summarySearch && (
                  <button 
                    type="button" 
                    onClick={() => setSummarySearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={summarySort}
                    onChange={(e) => setSummarySort(e.target.value)}
                    className="pl-8.5 pr-8 py-2 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer w-full sm:w-auto"
                  >
                    <option value="absent-desc">Most Absences (Highest First)</option>
                    <option value="pct-asc">Lowest Attendance %</option>
                    <option value="pct-desc">Highest Attendance %</option>
                    <option value="roll-asc">Roll Number (1, 2, 3...)</option>
                    <option value="name-asc">Student Name (A to Z)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Distinct Metric Stat Cards for Summary Period */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 p-3.5 rounded-2xl shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Days Tracked</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{recordedDaysCount} Days</span>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/60 border border-rose-500/30 p-3.5 rounded-2xl shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Total Chhuttiyan</span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-300 font-mono">{totalAcademyAbsents} Absents</span>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/60 border border-amber-500/30 p-3.5 rounded-2xl shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">3+ Absents</span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-300 font-mono">{highAbsenteesCount} Students</span>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/60 border border-emerald-500/30 p-3.5 rounded-2xl shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Avg Attendance</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-300 font-mono">{avgAttendanceRate}%</span>
              </div>
            </div>
          </div>

          {/* 3. Summary & Absents Table */}
          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  {isAllClasses ? 'All Students Leave & Attendance Report' : `Class ${currentClass?.name || ''} Leave & Attendance Report`}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md font-mono bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 font-bold">
                  {filteredAndSortedSummaries.length} Students
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Period: {startDate} ➔ {endDate} ({rangeLabel})</span>
            </div>

            {filteredAndSortedSummaries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                      <th className="py-3.5 px-4 whitespace-nowrap">Roll #</th>
                      {isAllClasses && <th className="py-3.5 px-4 whitespace-nowrap">Class</th>}
                      <th className="py-3.5 px-4 whitespace-nowrap">Student Name</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Father Name</th>
                      <th className="py-3.5 px-4 text-center whitespace-nowrap">Total Days</th>
                      <th className="py-3.5 px-4 text-center whitespace-nowrap">حاضر (Presents)</th>
                      <th className="py-3.5 px-4 text-center whitespace-nowrap bg-rose-500/5 dark:bg-rose-500/10">چھٹیاں (Absents)</th>
                      <th className="py-3.5 px-4 text-center whitespace-nowrap">لیٹ (Late)</th>
                      <th className="py-3.5 px-4 text-center whitespace-nowrap">حاضری فیصد %</th>
                      <th className="py-3.5 px-4 text-center whitespace-nowrap print:hidden">تفصیل و ایکشن</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60 text-slate-900 dark:text-slate-200">
                    {filteredAndSortedSummaries.map((summaryItem) => {
                      const { student, totalMarkedDays, presentCount, absentCount, lateCount, percentage } = summaryItem;
                      const hasSevereAbsents = absentCount >= 3;

                      return (
                        <tr 
                          key={student.id} 
                          className={`transition-colors ${
                            hasSevereAbsents 
                              ? 'bg-rose-500/5 hover:bg-rose-500/10 dark:bg-rose-500/5 dark:hover:bg-rose-500/10' 
                              : 'hover:bg-indigo-50/50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono text-xs text-indigo-700 dark:text-indigo-400 font-extrabold whitespace-nowrap">
                            #{student.rollNo}
                          </td>

                          {isAllClasses && (
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
                                Class {(data?.classes || []).find(c => c.id === student.classId)?.name || 'N/A'}
                              </span>
                            </td>
                          )}

                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span>{student.name}</span>
                              {hasSevereAbsents && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                                  ⚠️ {absentCount} Chhuttiyan
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                            {student.fname || 'N/A'}
                          </td>

                          <td className="py-3.5 px-4 text-center font-mono text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {totalMarkedDays}
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                              {presentCount}
                            </span>
                          </td>

                          {/* Absent Count (Chhuttiyan) highlighted prominently */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap bg-rose-500/5 dark:bg-rose-500/10">
                            <span className={`px-3 py-1 rounded-xl text-xs font-extrabold font-mono inline-flex items-center gap-1 shadow-xs ${
                              absentCount > 0 
                                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-rose-600/30' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}>
                              {absentCount > 0 && <XCircle className="w-3.5 h-3.5" />}
                              <span>{absentCount}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-mono">
                              {lateCount}
                            </span>
                          </td>

                          {/* Percentage with Visual Meter */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded-lg ${
                                percentage >= 80 
                                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20' 
                                  : percentage >= 60 
                                  ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20' 
                                  : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20'
                              }`}>
                                {totalMarkedDays > 0 ? `${percentage}%` : 'N/A'}
                              </span>
                              {totalMarkedDays > 0 && (
                                <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      percentage >= 80 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`} 
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Action Buttons: View Exact Dates & WhatsApp Parent Alert */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap print:hidden">
                            <div className="flex items-center justify-center gap-2">
                              {/* View Exact Absent Dates */}
                              <button
                                type="button"
                                onClick={() => setDetailModalStudent(summaryItem)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-xs"
                                title="View exact dates of attendance & leaves"
                              >
                                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                                <span>تاریخیں (Dates)</span>
                              </button>

                              {/* WhatsApp Parent Alert Button */}
                              {absentCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenSummarySms(summaryItem)}
                                  className="px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
                                  title="Send Absent Summary to Parents on WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>اطلاع (Alert)</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                {summarySearch ? (
                  <p>No students match your search: <strong>"{summarySearch}"</strong>.</p>
                ) : (
                  <p>No attendance records found between <strong>{startDate}</strong> and <strong>{endDate}</strong> for this selection. Please select a different duration or take attendance in the Daily Register first.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: STUDENT EXACT DATES DETAIL MODAL */}
      {/* ============================================================ */}
      {detailModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] flex flex-col relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    {detailModalStudent.student.name}
                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-black">
                      #{detailModalStudent.student.rollNo}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Class {(data?.classes || []).find(c => c.id === detailModalStudent.student.classId)?.name || 'N/A'} • Father: {detailModalStudent.student.fname || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-4 gap-2 text-center p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Days</span>
                <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-200">{detailModalStudent.totalMarkedDays}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-500 block">Present</span>
                <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">{detailModalStudent.presentCount}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-500 block">Chhuttiyan</span>
                <span className="text-sm font-black font-mono text-rose-600 dark:text-rose-400">{detailModalStudent.absentCount}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-500 block">Percentage</span>
                <span className="text-sm font-black font-mono text-indigo-600 dark:text-indigo-400">{detailModalStudent.percentage}%</span>
              </div>
            </div>

            {/* List of dates */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                📅 تمام تاریخوں کا ریکارڈ ({startDate} تا {endDate}):
              </span>
              
              {detailModalStudent.history.length > 0 ? (
                detailModalStudent.history.map((h, idx) => {
                  const isAbs = h.status === 'Absent';
                  const isLate = h.status === 'Late';
                  const isPres = h.status === 'Present';

                  return (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        isAbs 
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold' 
                          : isLate 
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold' 
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isAbs && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                        {isLate && <Clock className="w-4 h-4 text-amber-600 shrink-0" />}
                        {isPres && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        <span className="font-mono">{h.date}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        isAbs ? 'bg-rose-600 text-white' : isLate ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
                      }`}>
                        {isAbs ? 'غیر حاضر (Absent)' : isLate ? 'لیٹ (Late)' : 'حاضر (Present)'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-xs text-slate-400 py-6">اس دورانیے میں کوئی ریکارڈ نہیں ملا۔</p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setDetailModalStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                بند کریں (Close)
              </button>

              {detailModalStudent.absentCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    handleOpenSummarySms(detailModalStudent);
                    setDetailModalStudent(null);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>والدین کو واٹس ایپ بھیجیں</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: DAILY ABSENT WHATSAPP PREVIEW MODAL */}
      {/* ============================================================ */}
      {smsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div 
            className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-2xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] flex flex-col relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    والدین کے لیے حاضری اطلاع
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      Jameel Noori Nastaleeq
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    To: {smsModal.student.name} ({smsModal.phone ? `+${smsModal.phone}` : 'No Phone'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSmsModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Box */}
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <div 
                dir="rtl"
                style={{ unicodeBidi: 'plaintext' }}
                className="font-nastaleeq p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-500/30 text-slate-100 text-base md:text-lg leading-relaxed shadow-inner select-text whitespace-pre-line text-right max-h-[50vh] overflow-y-auto"
              >
                {smsModal.msg}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(smsModal.msg);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2500);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'کاپی ہو گیا!' : 'کاپی میسج'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSmsModal(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  کینسل
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSendWhatsApp(smsModal.phone, smsModal.msg);
                    setSmsModal(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>واٹس ایپ پر بھیجیں</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: SUMMARY ABSENT REPORT WHATSAPP PREVIEW MODAL */}
      {/* ============================================================ */}
      {summarySmsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div 
            className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-2xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] flex flex-col relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    چھٹیاں و حاضری خلاصہ رپورٹ
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      Jameel Noori Nastaleeq
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    To: {summarySmsModal.student.name} ({summarySmsModal.phone ? `+${summarySmsModal.phone}` : 'No Phone'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSummarySmsModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Box */}
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <div 
                dir="rtl"
                style={{ unicodeBidi: 'plaintext' }}
                className="font-nastaleeq p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-500/30 text-slate-100 text-base md:text-lg leading-relaxed shadow-inner select-text whitespace-pre-line text-right max-h-[50vh] overflow-y-auto"
              >
                {summarySmsModal.msg}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(summarySmsModal.msg);
                  setIsSummaryCopied(true);
                  setTimeout(() => setIsSummaryCopied(false), 2500);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                {isSummaryCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{isSummaryCopied ? 'کاپی ہو گیا!' : 'کاپی میسج'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSummarySmsModal(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  کینسل
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSendWhatsApp(summarySmsModal.phone, summarySmsModal.msg);
                    setSummarySmsModal(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>واٹس ایپ پر بھیجیں</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
