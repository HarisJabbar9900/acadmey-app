import React from 'react';
import { Printer, GraduationCap, Award, Calendar, CheckCircle2, XCircle, FileText } from 'lucide-react';

export default function ReportCardModal({ student, month, data, onClose }) {
  if (!student) return null;

  const studentClass = data.classes.find(c => c.id === student.classId);

  // 1. Calculate Monthly Test Scores for this student
  const monthlyTests = (data.tests || []).filter(t => {
    const isClassMatch = t.classId === student.classId;
    const isMonthMatch = t.month === month || t.date?.startsWith(month);
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

  Object.entries(data.attendance || {}).forEach(([key, record]) => {
    if (key.startsWith(month) && record.classId === student.classId) {
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 my-auto print:p-0 print:shadow-none print:w-full print:max-w-none">
        
        {/* Header Title Banner */}
        <div className="border-b-2 border-indigo-900 pb-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-indigo-900">
            <GraduationCap className="w-8 h-8" />
            <h1 className="text-2xl font-black uppercase tracking-wider">Al-Zia Science Academy</h1>
          </div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            Official Monthly Student Progress & Performance Report Card
          </p>
          <div className="inline-block bg-indigo-900 text-white text-xs font-mono font-bold px-3.5 py-1 rounded-full mt-1">
            Month: {(() => {
              if (!month) return 'Current Month';
              try {
                const [year, m] = month.split('-');
                const date = new Date(year, parseInt(m, 10) - 1, 1);
                return date.toLocaleString('default', { month: 'long', year: 'numeric' });
              } catch (e) {
                return month;
              }
            })()}
          </div>
        </div>

        {/* Student Personal Info Grid */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
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
            <span className="font-bold text-slate-800">Class {studentClass?.name || 'N/A'}</span>
          </div>
        </div>

        {/* Monthly Attendance Summary Box */}
        <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-700" />
            <span className="font-bold text-slate-700 font-sans">Monthly Attendance:</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Total Days: <strong>{totalDays}</strong></span>
            <span className="text-emerald-700 font-bold">Present: {presentDays}</span>
            <span className="text-rose-700 font-bold">Absent: {absentDays}</span>
            <span className="bg-indigo-900 text-white font-bold px-2 py-0.5 rounded text-[11px]">
              {attendancePercentage}%
            </span>
          </div>
        </div>

        {/* Subject-Wise Test Performance Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <Award className="w-4 h-4 text-indigo-700" /> Subject-Wise Test Evaluation Ledger
          </h3>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-indigo-900 text-white font-sans text-[11px] uppercase">
                <th className="p-2.5 rounded-tl-lg">Subject Name</th>
                <th className="p-2.5">Date</th>
                <th className="p-2.5 text-center">Obtained Marks</th>
                <th className="p-2.5 text-center">Total Marks</th>
                <th className="p-2.5 text-center">Percentage</th>
                <th className="p-2.5 text-center rounded-tr-lg">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border-x border-b border-slate-200 font-mono">
              {subjectScores.length > 0 ? (
                subjectScores.map((score, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2.5 font-bold font-sans text-slate-900">{score.subject}</td>
                    <td className="p-2.5 text-slate-600 text-[11px]">{score.date}</td>
                    <td className="p-2.5 text-center font-bold text-indigo-900">{score.obtained}</td>
                    <td className="p-2.5 text-center text-slate-600">{score.max}</td>
                    <td className="p-2.5 text-center font-bold">{score.pct}%</td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
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
                  <td colSpan="6" className="p-6 text-center text-slate-500 italic font-sans">
                    No tests recorded for this student in {month}.
                  </td>
                </tr>
              )}
            </tbody>
            {subjectScores.length > 0 && (
              <tfoot>
                <tr className="bg-indigo-50 font-bold border-t-2 border-indigo-900 font-mono text-xs">
                  <td colSpan="2" className="p-2.5 font-sans uppercase">Overall Summary Total:</td>
                  <td className="p-2.5 text-center text-indigo-900 text-sm font-extrabold">{grandObtained}</td>
                  <td className="p-2.5 text-center text-slate-700">{grandMax}</td>
                  <td className="p-2.5 text-center text-indigo-950 text-sm font-extrabold">{overallPercentage}%</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2.5 py-0.5 bg-indigo-900 text-white rounded font-extrabold text-xs">
                      {overallGrade}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Teacher Remarks & Principal Signature Box */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
          <div className="border border-slate-200 p-3 rounded-xl bg-slate-50 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-500 font-sans block">Teacher Remarks & Conduct</span>
            <p className="text-xs italic text-slate-700">
              {overallPercentage >= 75 
                ? 'Excellent academic performance! Keep up the hard work.'
                : overallPercentage >= 50
                ? 'Satisfactory performance. Daily revision recommended.'
                : 'Needs improvement in core concepts and regular attendance.'}
            </p>
          </div>

          <div className="flex flex-col justify-end items-end pr-4 text-center">
            <div className="w-40 border-b-2 border-slate-900 mb-1" />
            <span className="text-xs font-bold text-slate-900 font-sans uppercase">Principal / Director</span>
            <span className="text-[10px] text-slate-500 font-mono">Al-Zia Science Academy</span>
          </div>
        </div>

        {/* Print & Close Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Progress Report Card
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
