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
  FileText
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

export default function AdminDashboard({ data, selectedClassId, isAdminLoggedIn, onlineUsers = [] }) {
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
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
      <div className="dashboard-layout-main space-y-8 print:hidden">

      {/* 1. 🏆 Class-Wise Top High Scorers (Wall of Honor - RIGHT BELOW ANNOUNCEMENT BANNER) */}
      <div className="glass-panel glow-accent-amber p-6 rounded-2xl shadow-xl space-y-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4 text-amber-400" /> Class Wall of Honor
            </div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              🏆 Class-Wise Top High Scorers
            </h3>
            <p className="text-xs text-slate-400">
              Highest scoring student in each class with overall combined marks & percentage.
            </p>
          </div>

          <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold font-mono">
            {classTopScorers.filter(c => c.topScorer).length} Top Achievers
          </span>
        </div>

        <div className="flex flex-nowrap justify-center items-stretch gap-4 overflow-x-auto no-scrollbar pb-1">
          {classTopScorers.map(c => {
            const scorer = c.topScorer;

            return (
              <div
                key={c.classId}
                className="flex-1 min-w-[210px] max-w-[270px] glass-card p-4 rounded-2xl flex flex-col justify-between transition-all group shrink-0 sm:shrink"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-600 text-white shadow-sm">
                      Class {c.className}
                    </span>
                    {scorer && (
                      <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        🏆 #{scorer.rollNo}
                      </span>
                    )}
                  </div>

                  {scorer ? (
                    <div className="space-y-2 mt-2">
                      <h4 className="font-extrabold text-white text-sm group-hover:text-amber-300 transition-colors leading-tight">
                        {scorer.studentName}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {scorer.fname}
                      </p>

                      <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20 space-y-1">
                        <div className="text-[11px] font-bold text-indigo-300 flex items-center justify-between">
                          <span>Overall Score:</span>
                          <span className="text-emerald-400 font-bold font-mono">{scorer.obtainedMarks} / {scorer.maxMarks}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center justify-between">
                          <span>Tests Evaluated:</span>
                          <span className="text-slate-300 font-semibold">{scorer.testsTaken} Subject(s)</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-500 text-xs italic">
                      No test marks recorded for Class {c.className} yet.
                    </div>
                  )}
                </div>

                {scorer && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                    {isAdminLoggedIn ? (
                      <button
                        onClick={() => setSelectedCertificateScorer(scorer)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer hover:shadow-amber-500/30"
                        title="Generate & Print Official Class Topper Certificate of Excellence"
                      >
                        <Award className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                        <span>Certificate</span>
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>1st Position</span>
                      </span>
                    )}
                    <span className="font-mono font-extrabold text-emerald-400 text-xs bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 flex items-center">
                      {scorer.percentage}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Dashboard Top Header & Month Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-panel glow-accent-indigo p-6 rounded-2xl shadow-xl overflow-hidden">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> {isAdminLoggedIn ? 'Admin Management & Analytics' : 'Al-Zia Academy Portal'}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isAdminLoggedIn ? 'Admin Dashboard' : 'Academy Dashboard'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {isAdminLoggedIn 
              ? 'Track student attendance, fee collections, test score accumulations, and overall class performance.'
              : 'Welcome to Al-Zia Science Academy portal. View latest announcement notices, class wall of honor, and monthly performance.'}
          </p>
        </div>

        {/* Month Picker */}
        <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2 shadow-sm">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-slate-400 font-medium">Month:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* 3. KPI Metric Cards (Visible ONLY to Logged-in Admin) */}
      {isAdminLoggedIn && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Students */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Students
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Users className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {filteredStudents.length}
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Enrolled</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md text-[11px]">
                {filteredClasses.length} Classes
              </span>
            </div>
          </div>

          {/* Card 2: Attendance Rate */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Avg Attendance
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <CheckCircle className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1.5">
              <span>{attendancePercentage}%</span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {presentEntries} Present
              </span>
              <span className="text-rose-500 dark:text-rose-400 font-semibold flex items-center gap-1 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> {absentEntries} Absent
              </span>
            </div>
          </div>

          {/* Card 3: Fee Revenue */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Fee Revenue
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              Rs. {monthlyTotalCollectedFee.toLocaleString()}
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 text-[11px]">Pending:</span>
              <span className="font-semibold text-rose-500 dark:text-rose-400 text-[11px]">
                Rs. {monthlyTotalPendingFee.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Card 4: Real-Time Active Online Visitors */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active Visitors
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Users className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-2 font-mono">
              <span className="text-emerald-600 dark:text-emerald-400">{onlineCount}</span>
              <span className="text-xs font-sans font-bold text-slate-400">Online</span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">{desktopCount} PC</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">{mobileCount} Mobile</span>
            </div>
          </div>

        </div>
      )}

      {/* 4. 📋 Monthly Student Scores Accumulation Ledger (Full Width - 100% Space) */}
      <div className="glass-panel glow-accent-indigo rounded-2xl p-6 sm:p-7 shadow-xl w-full overflow-hidden mt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/80 gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Monthly Marks Accumulation Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total obtained marks vs max available marks for {formattedMonthName}</p>
          </div>
          <span className="text-xs font-semibold px-3.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 rounded-full w-fit shadow-sm">
            {monthlyTests.length} Subject Test(s) Evaluated
          </span>
        </div>

        {/* Class-Wise 1st Rank Toppers Grid Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
          {filteredClasses.map((cls) => {
            const classTopper = studentPerformance.find(s => s.className === cls.name && s.classRank === 1 && s.totalMaxMarks > 0);
            return (
              <div key={cls.id} className="glass-card border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-amber-500 dark:text-amber-400 font-mono tracking-wider">
                    Class {cls.name} 1st Rank
                  </span>
                  <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                </div>
                {classTopper ? (
                  <div className="mt-2 space-y-0.5">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{classTopper.name}</p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 font-mono">#{classTopper.rollNo}</span>
                      <span className="text-amber-500 dark:text-amber-400 font-black">{classTopper.percentage}%</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-2">No test data</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Full-Width Marks Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-3.5 whitespace-nowrap">Roll #</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[200px]">Student Name</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[140px]">Father Name</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[80px]">Class</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap min-w-[150px]">Marks Obtained / Max</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap min-w-[150px]">Percentage</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap min-w-[130px]">Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60 text-slate-900 dark:text-slate-200">
              {studentPerformance.length > 0 ? (
                studentPerformance.map((std) => {
                  const studentObj = data.students.find(s => s.id === std.id);

                  return (
                    <tr key={std.id} className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3.5 font-mono text-xs text-indigo-700 dark:text-indigo-400 font-extrabold whitespace-nowrap">#{std.rollNo}</td>
                      <td className="py-3.5 px-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span>{std.name}</span>
                          {std.totalMaxMarks > 0 && std.classRank === 1 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-amber-100 dark:bg-amber-500/15 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30 whitespace-nowrap shrink-0 shadow-sm">
                              🥇 #1 Rank
                            </span>
                          )}
                          {std.totalMaxMarks > 0 && std.classRank === 2 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-sky-100 dark:bg-slate-700/60 text-sky-900 dark:text-slate-200 px-2.5 py-0.5 rounded-full border border-sky-300 dark:border-slate-600 whitespace-nowrap shrink-0 shadow-sm">
                              🥈 #2 Rank
                            </span>
                          )}
                          {std.totalMaxMarks > 0 && std.classRank === 3 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-orange-100 dark:bg-amber-700/15 text-orange-900 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-orange-300 dark:border-amber-600/30 whitespace-nowrap shrink-0 shadow-sm">
                              🥉 #3 Rank
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3.5 text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">{std.fname}</td>
                      <td className="py-3.5 px-3.5 text-xs text-slate-600 dark:text-slate-400 font-bold whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {std.className}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono whitespace-nowrap">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{std.obtainedMarks}</span>
                        <span className="text-slate-400 dark:text-slate-500"> / {std.totalMaxMarks}</span>
                      </td>
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className={`h-full rounded-full ${
                                std.percentage >= 80 ? 'bg-emerald-500' :
                                std.percentage >= 60 ? 'bg-indigo-500' :
                                std.percentage >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${std.percentage}%` }}
                            />
                          </div>
                          <span className={`font-bold text-xs px-2.5 py-0.5 rounded-lg whitespace-nowrap ${
                            std.percentage >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                            std.percentage >= 60 ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' :
                            std.percentage >= 40 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                            'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}>
                            {std.percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedReportStudent(studentObj)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
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
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    No students found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. 📈 Performance Bar Chart (Full Width Below Ledger) */}
      <div className="glass-panel glow-accent-indigo rounded-2xl p-6 shadow-xl w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 mb-6 gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Performance Chart Overview
            </h3>
            <p className="text-xs text-slate-400">
              Cumulative score percentages for {formattedMonthName}
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700/80 rounded-full w-fit shadow-sm">
            {chartData.length} Student(s) Visualized
          </span>
        </div>

        {chartData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height={270} minWidth={0}>
              <BarChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} tickLine={false} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded-xl shadow-2xl space-y-1 text-xs font-sans">
                          <p className="font-extrabold text-indigo-300 border-b border-slate-700 pb-1">
                            {data.fullName} (Class {data.className})
                          </p>
                          <div className="flex items-center justify-between gap-4 text-[11px]">
                            <span className="text-slate-400">Score Percentage:</span>
                            <span className="font-extrabold font-mono text-emerald-400">{data.percentage}%</span>
                          </div>
                          {data.total > 0 && (
                            <div className="flex items-center justify-between gap-4 text-[10px]">
                              <span className="text-slate-400">Obtained Marks:</span>
                              <span className="font-semibold text-slate-200">{data.obtained} / {data.total}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm italic">
            No test data for this month.
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
