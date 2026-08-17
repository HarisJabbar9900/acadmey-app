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

export default function AdminDashboard({ data, selectedClassId, isAdminLoggedIn }) {
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [selectedReportStudent, setSelectedReportStudent] = useState(null);
  const [selectedCertificateScorer, setSelectedCertificateScorer] = useState(null);

  // Filter Students based on selected class
  const filteredStudents = selectedClassId === 'ALL'
    ? data.students
    : data.students.filter(s => s.classId === selectedClassId);

  // Filter Classes
  const filteredClasses = selectedClassId === 'ALL'
    ? data.classes
    : data.classes.filter(c => c.id === selectedClassId);

  // Calculate Attendance Stats
  let totalAttendanceEntries = 0;
  let presentEntries = 0;
  let absentEntries = 0;
  let lateEntries = 0;

  Object.values(data.attendance || {}).forEach(record => {
    if (selectedClassId === 'ALL' || record.classId === selectedClassId) {
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
  const monthlyTests = data.tests.filter(t => {
    const isClassMatch = selectedClassId === 'ALL' || t.classId === selectedClassId;
    const isMonthMatch = t.month === selectedMonth || t.date?.startsWith(selectedMonth);
    return isClassMatch && isMonthMatch;
  });

  const studentPerformance = filteredStudents.map(student => {
    let obtainedMarks = 0;
    let totalMaxMarks = 0;

    monthlyTests.forEach(test => {
      if (test.scores && test.scores[student.id] !== undefined) {
        obtainedMarks += Number(test.scores[student.id]) || 0;
        totalMaxMarks += Number(test.maxMarks) || 0;
      }
    });

    const percentage = totalMaxMarks > 0 
      ? Math.round((obtainedMarks / totalMaxMarks) * 100) 
      : 0;

    const studentClass = data.classes.find(c => c.id === student.classId)?.name || 'N/A';

    return {
      id: student.id,
      rollNo: student.rollNo,
      name: student.name,
      fname: student.fname || 'N/A',
      className: studentClass,
      obtainedMarks,
      totalMaxMarks,
      percentage,
      testsTaken: monthlyTests.filter(t => t.scores && t.scores[student.id] !== undefined).length
    };
  }).sort((a, b) => b.percentage - a.percentage);

  // Class-Wise Top High Scorers Calculation (Combined overall score across all subjects)
  const classTopScorers = filteredClasses.map(cls => {
    const classStudents = data.students.filter(s => s.classId === cls.id);
    const classTests = data.tests.filter(t => t.classId === cls.id);

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
      {/* 🏆 Class-Wise Top High Scorers (Wall of Honor - Right Below Notice Board) */}
      <div className="bg-gradient-to-r from-amber-950/20 via-slate-900 to-indigo-950/20 border border-amber-500/30 p-6 rounded-2xl shadow-xl space-y-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {classTopScorers.map(c => {
            const scorer = c.topScorer;

            return (
              <div
                key={c.classId}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 p-4 rounded-xl shadow-lg flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-600 text-white shadow-sm">
                      Class {c.className}
                    </span>
                    {scorer && (
                      <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
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

                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80 space-y-1">
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
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    {isAdminLoggedIn ? (
                      <button
                        onClick={() => setSelectedCertificateScorer(scorer)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[11px] font-extrabold inline-flex items-center gap-1 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                        title="Generate & Print Official Class Topper Certificate of Excellence"
                      >
                        📜 Certificate
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1">
                        🏆 1st Position
                      </span>
                    )}
                    <span className="font-mono font-extrabold text-emerald-400 text-sm bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {scorer.percentage}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
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
        <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2">
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

      {/* KPI Metric Cards (Visible ONLY to Logged-in Admin) */}
      {isAdminLoggedIn && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Total Students */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Students</span>
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{filteredStudents.length}</div>
            <p className="text-xs text-slate-500 mt-1">Enrolled across {filteredClasses.length} class(es)</p>
          </div>

          {/* Card 2: Attendance Rate */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Avg Attendance</span>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{attendancePercentage}%</div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="text-emerald-400 font-semibold">{presentEntries} Present</span>
              <span>•</span>
              <span className="text-rose-400 font-semibold">{absentEntries} Absent</span>
            </div>
          </div>

          {/* Card 3: Fee Revenue */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Fee Revenue ({selectedMonth})</span>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">Rs. {monthlyTotalCollectedFee.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Rs. {monthlyTotalPendingFee.toLocaleString()} pending
            </p>
          </div>

          {/* Card 4: Top Performer Avg */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Highest Monthly Score</span>
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-amber-400">
              {studentPerformance.length > 0 ? `${studentPerformance[0].percentage}%` : 'N/A'}
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate font-semibold">
              {studentPerformance.length > 0 ? `Top: ${studentPerformance[0].name}` : 'No test records'}
            </p>
          </div>

        </div>
      )}

      {/* Monthly Performance Visual Chart & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Bar Chart */}
        <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Performance Chart
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Cumulative score percentages for {selectedMonth}
            </p>
          </div>

          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height={240} minWidth={0}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    formatter={(value) => [`${value}%`, 'Score Percentage']}
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

        {/* Monthly Student Scores Accumulation Table */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-4 gap-2">
            <div>
              <h3 className="text-lg font-bold text-white">Monthly Marks Accumulation Ledger</h3>
              <p className="text-xs text-slate-400">Total obtained marks vs max available marks for {selectedMonth}</p>
            </div>
            <span className="text-xs font-medium px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full w-fit">
              {monthlyTests.length} Subject Test(s) Evaluated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-3">Roll #</th>
                  <th className="pb-3 px-3">Student Name</th>
                  <th className="pb-3 px-3">Father Name</th>
                  <th className="pb-3 px-3">Class</th>
                  <th className="pb-3 px-3 text-center">Marks Obtained / Max</th>
                  <th className="pb-3 px-3 text-right">Percentage</th>
                  {isAdminLoggedIn && <th className="pb-3 px-3 text-center">Report Card</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {studentPerformance.length > 0 ? (
                  studentPerformance.map((std, idx) => {
                    const studentObj = data.students.find(s => s.id === std.id);

                    return (
                      <tr key={std.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-3 font-mono text-xs text-indigo-400 font-bold">#{std.rollNo}</td>
                        <td className="py-3.5 px-3 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span>{std.name}</span>
                            {idx === 0 && std.totalMaxMarks > 0 && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                                🏆 #1 Rank
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-300">{std.fname}</td>
                        <td className="py-3.5 px-3 text-xs text-slate-400 font-semibold">{std.className}</td>
                        <td className="py-3.5 px-3 text-center font-mono">
                          <span className="text-indigo-400 font-bold">{std.obtainedMarks}</span>
                          <span className="text-slate-500"> / {std.totalMaxMarks}</span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden hidden sm:block">
                              <div 
                                className={`h-full rounded-full ${
                                  std.percentage >= 80 ? 'bg-emerald-400' :
                                  std.percentage >= 60 ? 'bg-indigo-400' :
                                  std.percentage >= 40 ? 'bg-amber-400' : 'bg-rose-400'
                                }`}
                                style={{ width: `${std.percentage}%` }}
                              />
                            </div>
                            <span className={`font-bold text-xs px-2 py-0.5 rounded-lg ${
                              std.percentage >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              std.percentage >= 60 ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                              std.percentage >= 40 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {std.percentage}%
                            </span>
                          </div>
                        </td>
                        {isAdminLoggedIn && (
                          <td className="py-3.5 px-3 text-center">
                            <button
                              onClick={() => setSelectedReportStudent(studentObj)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                              title="Print Student Monthly Report Card"
                            >
                              <Printer className="w-3.5 h-3.5" /> Report Card
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={isAdminLoggedIn ? 7 : 6} className="py-8 text-center text-slate-500 italic">
                      No students found for the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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
