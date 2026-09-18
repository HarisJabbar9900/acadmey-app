import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Printer, 
  GraduationCap, 
  Award, 
  Calendar, 
  CheckSquare, 
  Square, 
  Search, 
  X, 
  Users, 
  TrendingUp,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export default function BatchReportCardModal({ 
  data, 
  initialClassId, 
  initialMonth, 
  onClose 
}) {
  const safeClasses = useMemo(() => Array.isArray(data?.classes) ? data.classes : [], [data?.classes]);
  const safeStudents = useMemo(() => Array.isArray(data?.students) ? data.students : [], [data?.students]);
  const safeTests = useMemo(() => Array.isArray(data?.tests) ? data.tests : [], [data?.tests]);
  const safeAttendance = useMemo(() => data?.attendance || {}, [data?.attendance]);

  // Determine starting class
  const defaultClassId = (initialClassId && initialClassId !== 'ALL' && safeClasses.some(c => c.id === initialClassId))
    ? initialClassId
    : (safeClasses[0]?.id || 'cls-9th');

  const [selectedClassId, setSelectedClassId] = useState(defaultClassId);
  const [selectedMonth, setSelectedMonth] = useState(() => initialMonth || new Date().toISOString().slice(0, 7));
  const [searchQuery, setSearchQuery] = useState('');

  const currentClass = safeClasses.find(c => c.id === selectedClassId) || { name: 'Class' };
  
  // Students belonging to current class
  const classStudents = useMemo(() => {
    return safeStudents
      .filter(s => s && s.classId === selectedClassId)
      .sort((a, b) => {
        const rollA = Number(a.rollNo) || 0;
        const rollB = Number(b.rollNo) || 0;
        return rollA - rollB;
      });
  }, [safeStudents, selectedClassId]);

  // Selected student IDs for printing
  const [selectedIds, setSelectedIds] = useState(() => new Set(classStudents.map(s => s.id)));

  // Update selectedIds when class changes
  React.useEffect(() => {
    setSelectedIds(new Set(classStudents.map(s => s.id)));
  }, [selectedClassId, classStudents]);

  // Toggle single student selection
  const handleToggleStudent = (studentId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  // Toggle all students
  const handleToggleAll = () => {
    if (selectedIds.size === classStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(classStudents.map(s => s.id)));
    }
  };

  // Month Title Formatter
  const getMonthTitle = (monthStr) => {
    if (!monthStr) return 'Current Month';
    try {
      const [year, m] = monthStr.split('-');
      const date = new Date(year, parseInt(m, 10) - 1, 1);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    } catch (e) {
      return monthStr;
    }
  };

  const monthFormatted = getMonthTitle(selectedMonth);

  // Compute student data for each student
  const studentReports = useMemo(() => {
    return classStudents.map(student => {
      // 1. Calculate Monthly Test Scores for this student
      const monthlyTests = safeTests.filter(t => {
        if (!t) return false;
        const isClassMatch = t.classId === student.classId;
        const isMonthMatch = t.month === selectedMonth || t.date?.startsWith(selectedMonth);
        return isClassMatch && isMonthMatch && t.scores && t.scores[student.id] !== undefined;
      });

      let grandObtained = 0;
      let grandMax = 0;

      const subjectScores = monthlyTests.map(t => {
        const obtained = Number(t.scores[student.id]) || 0;
        const max = Number(t.maxMarks) || 100;
        grandObtained += obtained;
        grandMax += max;
        const pct = max > 0 ? Math.round((obtained / max) * 100) : 0;
        
        let grade = 'F';
        if (pct >= 85) grade = 'A+';
        else if (pct >= 75) grade = 'A';
        else if (pct >= 65) grade = 'B';
        else if (pct >= 50) grade = 'C';
        else if (pct >= 40) grade = 'D';

        return {
          testId: t.id,
          subject: t.subject,
          title: t.title || t.subject,
          date: t.date,
          obtained,
          max,
          pct,
          grade
        };
      });

      const overallPercentage = grandMax > 0 ? Math.round((grandObtained / grandMax) * 100) : 0;
      
      let overallGrade = 'F';
      if (overallPercentage >= 85) overallGrade = 'A+';
      else if (overallPercentage >= 75) overallGrade = 'A';
      else if (overallPercentage >= 65) overallGrade = 'B';
      else if (overallPercentage >= 50) overallGrade = 'C';
      else if (overallPercentage >= 40) overallGrade = 'D';

      // 2. Calculate Attendance for this month
      let totalDays = 0;
      let presentDays = 0;
      let absentDays = 0;
      let lateDays = 0;

      Object.entries(safeAttendance).forEach(([key, record]) => {
        if (!record) return;
        const recDate = record.date || key.split('_')[0];
        const recClassId = record.classId || key.split('_').slice(1).join('_');
        const isMonthMatch = (recDate && recDate.startsWith(selectedMonth)) || (key && key.startsWith(selectedMonth));
        const isClassMatch = (record.classId === student.classId) || (recClassId === student.classId);

        if (isMonthMatch && isClassMatch) {
          if (record.records && record.records[student.id]) {
            totalDays++;
            const st = record.records[student.id];
            if (st === 'Present') presentDays++;
            else if (st === 'Absent') absentDays++;
            else if (st === 'Late') lateDays++;
          }
        }
      });

      const attendancePercentage = totalDays > 0 
        ? Math.round(((presentDays + (lateDays * 0.5)) / totalDays) * 100) 
        : 100;

      return {
        student,
        subjectScores,
        grandObtained,
        grandMax,
        overallPercentage,
        overallGrade,
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendancePercentage
      };
    });
  }, [classStudents, safeTests, safeAttendance, selectedMonth]);

  // Filtered reports for preview search
  const filteredReports = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return studentReports;
    return studentReports.filter(r => 
      r.student.name.toLowerCase().includes(q) ||
      (r.student.rollNo && r.student.rollNo.toString().includes(q)) ||
      (r.student.fname && r.student.fname.toLowerCase().includes(q))
    );
  }, [studentReports, searchQuery]);

  // Reports that are selected for printing
  const selectedReportsToPrint = useMemo(() => {
    return studentReports.filter(r => selectedIds.has(r.student.id));
  }, [studentReports, selectedIds]);

  // Class Summary Metrics
  const classMetrics = useMemo(() => {
    if (studentReports.length === 0) return { avgScore: 0, avgAtt: 100, topper: null };

    const totalPct = studentReports.reduce((acc, r) => acc + r.overallPercentage, 0);
    const avgScore = Math.round(totalPct / studentReports.length);

    const totalAtt = studentReports.reduce((acc, r) => acc + r.attendancePercentage, 0);
    const avgAtt = Math.round(totalAtt / studentReports.length);

    let topper = null;
    let maxPct = -1;
    studentReports.forEach(r => {
      if (r.overallPercentage > maxPct && r.grandMax > 0) {
        maxPct = r.overallPercentage;
        topper = r;
      }
    });

    return { avgScore, avgAtt, topper };
  }, [studentReports]);

  // Handle Print Action
  const handlePrint = () => {
    if (selectedReportsToPrint.length === 0) {
      alert('براہ کرم پرنٹ کرنے کے لیے کم از کم ایک طالب علم کو سلیکٹ کریں!');
      return;
    }
    const oldTitle = document.title;
    const cleanClassName = (currentClass?.name || 'Class').replace(/\s+/g, '_');
    const cleanMonth = monthFormatted.replace(/\s+/g, '_');
    document.title = `${cleanClassName}_Class_Report_Cards_${cleanMonth}`;
    
    document.body.classList.add('printing-batch-report-active');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-batch-report-active');
      document.title = oldTitle;
    }, 1000);
  };

  return createPortal(
    <div className="batch-report-modal-wrapper fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      
      {/* Modal Inner Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[96vh] overflow-y-auto relative text-slate-900 dark:text-slate-100">
        
        {/* STICKY CONTROLS HEADER (Hidden during printing) */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 pb-4 pt-1 space-y-4 print-hidden print:hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 shadow-xs">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg">
                    Batch Print Class Report Cards
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-jameel font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    پوری کلاس کے رزلٹ کارڈز
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Print official monthly performance & attendance report cards for the entire class at once.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handlePrint}
                disabled={selectedReportsToPrint.length === 0}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>Print {selectedReportsToPrint.length} Report Cards (A4 PDF)</span>
              </button>

              <button
                onClick={onClose}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                title="Close Window"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Controls Bar: Class Selector, Month Picker, Search & Select All */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
            
            {/* Class Dropdown */}
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Select Class (کلاس منتخب کریں)
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {safeClasses.map(c => (
                  <option key={c.id} value={c.id}>
                    Class {c.name} ({safeStudents.filter(s => s.classId === c.id).length} Students)
                  </option>
                ))}
              </select>
            </div>

            {/* Examination Month */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Exam Month (مہینہ)
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Search Filter */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Filter Student (تلاش کریں)
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Name or roll #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Select All Toggle */}
            <div className="sm:col-span-2 flex flex-col justify-end">
              <button
                type="button"
                onClick={handleToggleAll}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {selectedIds.size === classStudents.length ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    <span>Select All ({classStudents.length})</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Quick Stats Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                Selected: <strong className="text-indigo-600 dark:text-indigo-400">{selectedIds.size}</strong> of {classStudents.length} Students
              </span>
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                Class Avg Marks: <strong className="text-slate-900 dark:text-white">{classMetrics.avgScore}%</strong>
              </span>
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                Avg Attendance: <strong className="text-slate-900 dark:text-white">{classMetrics.avgAtt}%</strong>
              </span>
            </div>

            {classMetrics.topper && (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/20 text-[11px]">
                <span>🏆 1st Position:</span>
                <span>{classMetrics.topper.student.name} ({classMetrics.topper.overallPercentage}%)</span>
              </div>
            )}
          </div>

        </div>

        {/* PRINTABLE CARDS CONTAINER */}
        <div id="batch-report-cards-print-area" className="space-y-8">
          
          {selectedReportsToPrint.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-2">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-700 dark:text-slate-300">کوئی طالب علم منتخب نہیں کیا گیا</p>
              <p>اوپر دی گئی لسٹ میں سے کم از کم ایک طالب علم سلیکٹ کریں تاکہ ان کے رزلٹ کارڈز پرنٹ ہو سکیں۔</p>
            </div>
          ) : (
            selectedReportsToPrint.map((report, cardIndex) => {
              const {
                student,
                subjectScores,
                grandObtained,
                grandMax,
                overallPercentage,
                overallGrade,
                totalDays,
                presentDays,
                absentDays,
                lateDays,
                attendancePercentage
              } = report;

              const isChecked = selectedIds.has(student.id);

              return (
                <div 
                  key={student.id} 
                  className="batch-report-card-item relative bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 mx-auto border border-slate-200 overflow-hidden"
                >
                  
                  {/* On-screen Page & Selection Banner (Hidden on Print) */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 print-hidden print:hidden">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStudent(student.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                        <span>Student #{cardIndex + 1}: {student.name} (Roll #{student.rollNo})</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-slate-500">
                      <span>Sheet {cardIndex + 1} of {selectedReportsToPrint.length}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        overallGrade === 'A+' || overallGrade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                        overallGrade === 'B' || overallGrade === 'C' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        Grade: {overallGrade} ({overallPercentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Watermark in Card Background */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0 overflow-hidden opacity-[0.04] print:opacity-[0.06]">
                    <GraduationCap className="w-80 h-80 text-indigo-950" />
                    <span className="text-3xl sm:text-5xl font-black tracking-widest text-indigo-950 uppercase font-serif text-center -rotate-12 whitespace-nowrap mt-3">
                      AL-ZIA SCIENCE ACADEMY
                    </span>
                    <span className="text-xs sm:text-sm font-bold tracking-widest text-slate-900 uppercase font-sans mt-2 -rotate-12">
                      Official Progress & Performance Report
                    </span>
                  </div>

                  {/* Card Main Body */}
                  <div className="relative z-10 space-y-5">
                    
                    {/* Header Title Banner */}
                    <div className="border-b-2 border-indigo-900 pb-3 text-center space-y-1">
                      <div className="flex items-center justify-center gap-2 text-indigo-900">
                        <GraduationCap className="w-7 h-7" />
                        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider">Al-Zia Science Academy</h1>
                      </div>
                      <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                        Official Monthly Student Progress & Performance Report Card
                      </p>
                      <div className="inline-block bg-indigo-900 text-white text-[11px] font-mono font-bold px-3 py-0.5 rounded-full mt-1 shadow-xs">
                        Month: {monthFormatted}
                      </div>
                    </div>

                    {/* Student Info Box */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">Student Name</span>
                        <span className="font-extrabold text-slate-900 text-sm">{student.name}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">Father Name</span>
                        <span className="font-bold text-slate-800">{student.fname || 'N/A'}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">Roll Number</span>
                        <span className="font-extrabold text-indigo-700 text-sm">#{student.rollNo}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">Class</span>
                        <span className="font-bold text-slate-800">Class {currentClass?.name || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Monthly Attendance Box */}
                    <div className="bg-slate-100/80 p-2.5 sm:p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-700 shrink-0" />
                        <span className="font-bold text-slate-700 font-sans">Monthly Attendance:</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <span>Total Days: <strong>{totalDays}</strong></span>
                        <span className="text-emerald-700 font-bold">Present: {presentDays}</span>
                        <span className="text-rose-700 font-bold">Absent: {absentDays}</span>
                        <span className="bg-indigo-900 text-white font-bold px-2 py-0.5 rounded text-[11px] shrink-0">
                          {attendancePercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Subject-Wise Test Ledger Table */}
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                        <Award className="w-3.5 h-3.5 text-indigo-700 shrink-0" /> Subject-Wise Test Evaluation Ledger
                      </h3>

                      <div className="overflow-x-auto -mx-1 sm:mx-0 rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs border-collapse min-w-[500px] print:min-w-0">
                          <thead>
                            <tr className="bg-indigo-900 text-white font-sans text-[10px] sm:text-[11px] uppercase">
                              <th className="p-2 rounded-tl-lg">Subject</th>
                              <th className="p-2">Date</th>
                              <th className="p-2 text-center">Obtained</th>
                              <th className="p-2 text-center">Total</th>
                              <th className="p-2 text-center">Percentage</th>
                              <th className="p-2 text-center rounded-tr-lg">Grade</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 border-x border-b border-slate-200 font-mono text-xs">
                            {subjectScores.length > 0 ? (
                              subjectScores.map((score, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                  <td className="p-2 font-bold font-sans text-slate-900">{score.subject}</td>
                                  <td className="p-2 text-slate-600 text-[11px]">{score.date}</td>
                                  <td className="p-2 text-center font-bold text-indigo-900">{score.obtained}</td>
                                  <td className="p-2 text-center text-slate-600">{score.max}</td>
                                  <td className="p-2 text-center font-bold">{score.pct}%</td>
                                  <td className="p-2 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      score.grade === 'A+' || score.grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                                      score.grade === 'B' || score.grade === 'C' ? 'bg-indigo-100 text-indigo-800' :
                                      'bg-rose-100 text-rose-800'
                                    }`}>
                                      {score.grade}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="6" className="p-4 text-center text-slate-500 italic font-sans text-xs">
                                  No test records registered for this student in {monthFormatted}.
                                </td>
                              </tr>
                            )}
                          </tbody>
                          {subjectScores.length > 0 && (
                            <tfoot>
                              <tr className="bg-indigo-50 font-bold border-t-2 border-indigo-900 font-mono text-xs">
                                <td colSpan="2" className="p-2 font-sans uppercase">Overall Summary:</td>
                                <td className="p-2 text-center text-indigo-900 font-extrabold">{grandObtained}</td>
                                <td className="p-2 text-center text-slate-700">{grandMax}</td>
                                <td className="p-2 text-center text-indigo-950 font-extrabold">{overallPercentage}%</td>
                                <td className="p-2 text-center">
                                  <span className="px-2.5 py-0.5 bg-indigo-900 text-white rounded font-extrabold text-[11px]">
                                    {overallGrade}
                                  </span>
                                </td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    </div>

                    {/* Teacher Remarks & Principal Signature Box */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                      <div className="border border-slate-200 p-2.5 rounded-xl bg-slate-50 space-y-0.5">
                        <span className="text-[10px] font-bold uppercase text-slate-500 font-sans block">Teacher Remarks & Conduct</span>
                        <p className="text-[11px] italic text-slate-700">
                          {overallPercentage >= 75 
                            ? 'Excellent academic performance! Keep up the hard work.'
                            : overallPercentage >= 50
                            ? 'Satisfactory performance. Daily revision recommended.'
                            : 'Needs improvement in core concepts and regular attendance.'}
                        </p>
                      </div>

                      <div className="flex flex-col justify-end items-end pr-4 text-center">
                        <div className="w-36 border-b-2 border-slate-900 mb-1" />
                        <span className="text-[11px] font-bold text-slate-900 font-sans uppercase">Administrator</span>
                        <span className="text-[9px] text-slate-500 font-mono">Al-Zia Science Academy</span>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })
          )}

        </div>

      </div>
    </div>,
    document.body
  );
}
