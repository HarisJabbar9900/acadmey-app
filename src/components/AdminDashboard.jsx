import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Clock,
  ChevronRight,
  Sparkles,
  Trophy,
  Printer,
  FileText,
  Trash2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import ReportCardModal from './ReportCardModal';
import CertificateModal from './CertificateModal';

export default function AdminDashboard({ data, selectedClassId, isAdminLoggedIn, onlineUsers = [], onPurgeAllData, onNavigate }) {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [selectedReportStudent, setSelectedReportStudent] = useState(null);
  const [selectedCertificateScorer, setSelectedCertificateScorer] = useState(null);
  const getMonthTitle = (monthStr) => {
    if (!monthStr) return '';
    try {
      const [year, m] = monthStr.split('-');
      const date = new Date(year, parseInt(m, 10) - 1, 1);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    } catch (e) {
      return monthStr;
    }
  };

  const formattedMonthName = getMonthTitle(selectedMonth);

  const safeOnlineUsers = Array.isArray(onlineUsers) ? onlineUsers : [];
  const onlineCount = safeOnlineUsers.length;
  const desktopCount = safeOnlineUsers.filter(u => u && typeof u.device === 'string' && u.device.includes('Desktop')).length;
  const mobileCount = safeOnlineUsers.filter(u => u && typeof u.device === 'string' && u.device.includes('Mobile')).length;

  const safeData = data || {};
  const safeStudents = Array.isArray(safeData.students) ? safeData.students : [];
  const safeClasses = Array.isArray(safeData.classes) ? safeData.classes : [];
  const safeTests = Array.isArray(safeData.tests) ? safeData.tests : [];

  // Filter Students based on selected class
  const filteredStudents = selectedClassId === 'ALL'
    ? safeStudents
    : safeStudents.filter(s => s && s.classId === selectedClassId);

  // Filter Classes
  const filteredClasses = selectedClassId === 'ALL'
    ? safeClasses
    : safeClasses.filter(c => c && c.id === selectedClassId);

  // Calculate Attendance Stats
  let totalAttendanceEntries = 0;
  let presentEntries = 0;
  let absentEntries = 0;
  let lateEntries = 0;

  Object.values(safeData.attendance || {}).forEach(record => {
    if (record && (selectedClassId === 'ALL' || record.classId === selectedClassId)) {
      Object.values(record.records || {}).forEach(status => {
        totalAttendanceEntries++;
        if (status === 'Present') presentEntries++;
        else if (status === 'Absent') absentEntries++;
        else if (status === 'Late') lateEntries++;
      });
    }
  });

  const attendancePercentage = totalAttendanceEntries > 0
    ? Math.round(((presentEntries + (lateEntries * 0.5)) / totalAttendanceEntries) * 100)
    : 100;

  // Calculate Monthly Test Performance (Student-wise accumulated totals)
  const monthlyTests = safeTests.filter(t => {
    if (!t) return false;
    const isClassMatch = selectedClassId === 'ALL' || t.classId === selectedClassId;
    const isMonthMatch = t.month === selectedMonth || t.date?.startsWith(selectedMonth);
    return isClassMatch && isMonthMatch;
  });

  const studentPerformance = filteredStudents.map(student => {
    let obtainedMarks = 0;
    let totalMaxMarks = 0;

    monthlyTests.forEach(test => {
      if (test && test.scores && test.scores[student.id] !== undefined) {
        obtainedMarks += Number(test.scores[student.id]) || 0;
        totalMaxMarks += Number(test.maxMarks) || 0;
      }
    });

    const percentage = totalMaxMarks > 0 
      ? Math.round((obtainedMarks / totalMaxMarks) * 100) 
      : 0;

    const studentClass = safeClasses.find(c => c.id === student.classId)?.name || 'N/A';

    return {
      id: student.id,
      rollNo: student.rollNo,
      name: student.name,
      fname: student.fname || 'N/A',
      className: studentClass,
      obtainedMarks,
      totalMaxMarks,
      percentage,
      testsTaken: monthlyTests.filter(t => t && t.scores && t.scores[student.id] !== undefined).length
    };
  }).sort((a, b) => b.percentage - a.percentage);

  // Compute Class-Wise Ranks (1st, 2nd, 3rd within each specific class)
  const classGrouped = {};
  studentPerformance.forEach(std => {
    if (!classGrouped[std.className]) {
      classGrouped[std.className] = [];
    }
    classGrouped[std.className].push(std);
  });

  Object.keys(classGrouped).forEach(clsName => {
    classGrouped[clsName].sort((a, b) => b.percentage - a.percentage);
    classGrouped[clsName].forEach((std, idx) => {
      std.classRank = idx + 1;
    });
  });

  // Class-Wise Top High Scorers Calculation (Combined overall score across all subjects - 4 Main Classes 9th-12th)
  const classTopScorers = filteredClasses
    .filter(cls => cls && cls.id !== 'cls-boys' && cls.name?.trim().toLowerCase() !== 'boys')
    .map(cls => {
    const classStudents = safeStudents.filter(s => s && s.classId === cls.id);
    const classTests = safeTests.filter(t => t && t.classId === cls.id);

    let topScorer = null;
    let maxOverallPct = -1;

    classStudents.forEach(student => {
      let totalObtained = 0;
      let totalMax = 0;
      let testsEvaluated = 0;
      let latestDate = '';

      classTests.forEach(test => {
        if (test.scores && test.scores[student.id] !== undefined) {
          const obt = Number(test.scores[student.id]);
          const max = Number(test.maxMarks);
          if (!isNaN(obt) && !isNaN(max) && max > 0) {
            totalObtained += obt;
            totalMax += max;
            testsEvaluated++;
            if (test.date) latestDate = test.date;
          }
        }
      });

      if (totalMax > 0) {
        const overallPct = Math.round((totalObtained / totalMax) * 100);
        if (overallPct > maxOverallPct) {
          maxOverallPct = overallPct;
          topScorer = {
            studentName: student.name,
            rollNo: student.rollNo,
            fname: student.fname || 'N/A',
            obtainedMarks: totalObtained,
            maxMarks: totalMax,
            percentage: overallPct,
            testsTaken: testsEvaluated,
            latestDate,
            className: cls.name
          };
        }
      }
    });

    return {
      classId: cls.id,
      className: cls.name,
      topScorer
    };
  });

  // Prepare chart data
  const chartData = studentPerformance.map(s => ({
    name: s.name.split(' ')[0],
    fullName: s.name,
    className: s.className,
    percentage: s.percentage,
    obtained: s.obtainedMarks,
    total: s.totalMaxMarks
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

  // Calculate Monthly Fee Revenue Statistics for selected month
  let monthlyTotalCollectedFee = 0;
  let monthlyTotalPendingFee = 0;
  const feesObj = data.fees || {};

  filteredStudents.forEach(student => {
    const feeKey = `${selectedMonth}_${student.id}`;
    const feeRecord = feesObj[feeKey];
    const expectedFee = feeRecord?.monthlyFee || feeRecord?.paidAmount || 0;

    if (feeRecord?.status === 'Paid') {
      monthlyTotalCollectedFee += Number(feeRecord.paidAmount) || expectedFee;
    } else {
      monthlyTotalPendingFee += expectedFee;
    }
  });

  return (
    <>
      <div className="dashboard-layout-main space-y-6 print:hidden">

        {/* 1. Dashboard Control Header: Title, Subtitle, Clear Data & Month Filter */}
        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAdminLoggedIn ? 'Admin Management & Analytics' : 'Al-Zia Academy Portal'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isAdminLoggedIn ? 'Admin Dashboard' : 'Academy Dashboard'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isAdminLoggedIn 
                ? 'Track student attendance, fee collections, test score accumulations, and overall class performance.'
                : 'Welcome to Al-Zia Science Academy portal. View latest announcement notices, class wall of honor, and monthly performance.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isAdminLoggedIn && onPurgeAllData && (
              <button
                type="button"
                onClick={onPurgeAllData}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Permanently wipe all sample/dummy records"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Sample Data</span>
              </button>
            )}

            {/* Month Picker */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-3 py-1.5 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Month:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 2. KPI Metric Cards (Visible to Admin) */}
        {isAdminLoggedIn && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Card 1: Total Students */}
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-indigo-500/40 transition-all group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Students
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {filteredStudents.length}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Enrolled</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md text-[10px]">
                  {filteredClasses.length} Classes
                </span>
              </div>
            </div>

            {/* Card 2: Attendance Rate */}
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-emerald-500/40 transition-all group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Avg Attendance
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shadow-xs">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {attendancePercentage}%
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {presentEntries} Present
                </span>
                <span className="text-rose-500 dark:text-rose-400 font-semibold flex items-center gap-1 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> {absentEntries} Absent
                </span>
              </div>
            </div>

            {/* Card 3: Fee Revenue */}
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-emerald-500/40 transition-all group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Fee Revenue
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shadow-xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight truncate">
                Rs. {monthlyTotalCollectedFee.toLocaleString()}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 text-[11px]">Pending:</span>
                <span className="font-semibold text-rose-500 dark:text-rose-400 text-[11px]">
                  Rs. {monthlyTotalPendingFee.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Card 4: Real-Time Active Online Visitors */}
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-emerald-500/40 transition-all group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Active Visitors
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-2 font-mono">
                <span className="text-emerald-600 dark:text-emerald-400">{onlineCount}</span>
                <span className="text-xs font-sans font-bold text-slate-400">Online</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">{desktopCount} PC</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">{mobileCount} Mobile</span>
              </div>
            </div>

          </div>
        )}

        {/* 3. 🏆 Class-Wise Top High Scorers (Wall of Honor) */}
        <div className="bg-white/95 dark:bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-0.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Class Wall of Honor</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                🏆 Class-Wise Top High Scorers
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Highest scoring student in each class with overall marks and percentage for {formattedMonthName}.
              </p>
            </div>

            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 rounded-xl text-xs font-bold font-mono shadow-xs w-fit">
              {classTopScorers.filter(c => c.topScorer).length} Top Achievers
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {classTopScorers.map(c => {
              const scorer = c.topScorer;

              return (
                <div
                  key={c.classId}
                  className="w-full bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between transition-all group hover:border-amber-500/40 shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-xs">
                        Class {c.className}
                      </span>
                      {scorer && (
                        <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-500/20 shadow-xs">
                          🏆 #{scorer.rollNo}
                        </span>
                      )}
                    </div>

                    {scorer ? (
                      <div className="space-y-2 mt-1.5">
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors leading-tight">
                            {scorer.studentName}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {scorer.fname || 'N/A'}
                          </p>
                        </div>

                        <div className="bg-white dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1 shadow-xs">
                          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                            <span>Score:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{scorer.obtainedMarks} / {scorer.maxMarks}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                            <span>Tests:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-semibold">{scorer.testsTaken} Subject(s)</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-5 text-center space-y-1">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                          <Trophy className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Awaiting Test Records</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Toppers will rank automatically</p>
                      </div>
                    )}
                  </div>

                  {scorer && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      {isAdminLoggedIn ? (
                        <button
                          type="button"
                          onClick={() => setSelectedCertificateScorer(scorer)}
                          className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 rounded-xl text-xs font-black inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          title="Generate & Print Official Class Topper Certificate of Excellence"
                        >
                          <Award className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                          <span>Certificate</span>
                        </button>
                      ) : (
                        <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                          <span>1st Position</span>
                        </span>
                      )}
                      <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-400 text-xs bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-xl border border-emerald-300 dark:border-emerald-500/20 flex items-center shadow-xs">
                        {scorer.percentage}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. 📋 Monthly Student Scores Accumulation Ledger */}
        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs w-full overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80 gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                Monthly Marks Accumulation Ledger
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total marks obtained vs maximum marks for {formattedMonthName}</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 rounded-full w-fit shadow-xs">
              {monthlyTests.length} Subject Test(s) Evaluated
            </span>
          </div>

          {/* Class-Wise 1st Rank Toppers Mini Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {filteredClasses.map((cls) => {
              const classTopper = studentPerformance.find(s => s.className === cls.name && s.classRank === 1 && s.totalMaxMarks > 0);
              return (
                <div key={cls.id} className="bg-slate-50/70 dark:bg-slate-800/50 border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 font-mono tracking-wider">
                      Class {cls.name} #1
                    </span>
                    <Trophy className="w-3 h-3 text-amber-500" />
                  </div>
                  {classTopper ? (
                    <div className="mt-1.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{classTopper.name}</p>
                      <div className="flex items-center justify-between text-[11px] mt-0.5">
                        <span className="text-slate-500 dark:text-slate-400 font-mono">#{classTopper.rollNo}</span>
                        <span className="text-amber-600 dark:text-amber-400 font-black">{classTopper.percentage}%</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-1.5">No test data</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Full-Width Marks Ledger Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-slate-700 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Roll #</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap min-w-[180px]">Student Name</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap min-w-[130px]">Father Name</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap min-w-[80px]">Class</th>
                  <th className="py-2.5 px-3.5 text-center whitespace-nowrap min-w-[140px]">Marks Obtained / Max</th>
                  <th className="py-2.5 px-3.5 text-right whitespace-nowrap min-w-[140px]">Percentage</th>
                  <th className="py-2.5 px-3.5 text-center whitespace-nowrap min-w-[120px]">Report Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60 text-slate-900 dark:text-slate-200">
                {studentPerformance.length > 0 ? (
                  studentPerformance.map((std) => {
                    const studentObj = data.students.find(s => s.id === std.id);

                    return (
                      <tr key={std.id} className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3.5 font-mono text-xs text-indigo-700 dark:text-indigo-400 font-extrabold whitespace-nowrap">#{std.rollNo}</td>
                        <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span>{std.name}</span>
                            {std.totalMaxMarks > 0 && std.classRank === 1 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-100 dark:bg-amber-500/15 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30 whitespace-nowrap shrink-0 shadow-xs">
                                🥇 #1 Rank
                              </span>
                            )}
                            {std.totalMaxMarks > 0 && std.classRank === 2 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-sky-100 dark:bg-slate-700/60 text-sky-900 dark:text-slate-200 px-2 py-0.5 rounded-full border border-sky-300 dark:border-slate-600 whitespace-nowrap shrink-0 shadow-xs">
                                🥈 #2 Rank
                              </span>
                            )}
                            {std.totalMaxMarks > 0 && std.classRank === 3 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-orange-100 dark:bg-amber-700/15 text-orange-900 dark:text-amber-400 px-2 py-0.5 rounded-full border border-orange-300 dark:border-amber-600/30 whitespace-nowrap shrink-0 shadow-xs">
                                🥉 #3 Rank
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">{std.fname}</td>
                        <td className="py-3 px-3.5 text-xs text-slate-600 dark:text-slate-400 font-bold whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {std.className}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono whitespace-nowrap">
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{std.obtainedMarks}</span>
                          <span className="text-slate-400 dark:text-slate-500"> / {std.totalMaxMarks}</span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                              <div 
                                className={`h-full rounded-full ${
                                  std.percentage >= 80 ? 'bg-emerald-500' :
                                  std.percentage >= 60 ? 'bg-indigo-500' :
                                  std.percentage >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${std.percentage}%` }}
                              />
                            </div>
                            <span className={`font-bold text-xs px-2 py-0.5 rounded-lg whitespace-nowrap ${
                              std.percentage >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                              std.percentage >= 60 ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' :
                              std.percentage >= 40 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                              'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}>
                              {std.percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedReportStudent(studentObj)}
                            className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap"
                            title="Print Student Monthly Report Card"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Report Card</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 px-4 text-center">
                      <div className="max-w-md mx-auto space-y-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                          <Users className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Students Enrolled Yet</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          The academy database is ready for your student records. You can enroll students into Class 9th, 10th, 11th, or 12th.
                        </p>
                        {isAdminLoggedIn && onNavigate && (
                          <button
                            type="button"
                            onClick={() => onNavigate('students')}
                            className="mt-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Enroll First Student</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. 📈 Performance Bar Chart */}
        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80 mb-4 gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                Performance Chart Overview
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cumulative score percentages for {formattedMonthName}
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 rounded-full w-fit shadow-xs">
              {chartData.length} Student(s) Visualized
            </span>
          </div>

          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height={250} minWidth={0}>
                <BarChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl shadow-xl space-y-1 text-xs font-sans">
                            <p className="font-extrabold text-indigo-300 border-b border-slate-700 pb-1">
                              {d.fullName} (Class {d.className})
                            </p>
                            <div className="flex items-center justify-between gap-4 text-[11px]">
                              <span className="text-slate-400">Score Percentage:</span>
                              <span className="font-extrabold font-mono text-emerald-400">{d.percentage}%</span>
                            </div>
                            {d.total > 0 && (
                              <div className="flex items-center justify-between gap-4 text-[10px]">
                                <span className="text-slate-400">Obtained Marks:</span>
                                <span className="font-semibold text-slate-200">{d.obtained} / {d.total}</span>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-36 flex flex-col items-center justify-center text-center p-4 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700/60">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ready For Real Exam Scores ({formattedMonthName})</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">
                Visual performance charts will populate automatically once subject tests and student marks are recorded.
              </p>
            </div>
          )}
        </div>

        {/* Printable Report Card Modal */}
        {selectedReportStudent && (
          <ReportCardModal
            student={selectedReportStudent}
            month={selectedMonth}
            data={data}
            onClose={() => setSelectedReportStudent(null)}
          />
        )}

        {/* Printable Class Topper Certificate of Excellence Modal */}
        {selectedCertificateScorer && (
          <CertificateModal
            scorer={selectedCertificateScorer}
            month={selectedMonth}
            onClose={() => setSelectedCertificateScorer(null)}
          />
        )}
      </div>
    </>
  );
}
