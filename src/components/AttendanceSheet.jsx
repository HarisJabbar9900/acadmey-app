import React, { useState } from 'react';
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
  Users
} from 'lucide-react';

export default function AttendanceSheet({ data, onSaveAttendance, selectedClassId, isAdminLoggedIn }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeClassId, setActiveClassId] = useState(selectedClassId && selectedClassId !== 'ALL' ? selectedClassId : 'ALL');
  const [smsModal, setSmsModal] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

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
  const classStudents = isAllClasses ? data.students : data.students.filter(s => s.classId === activeClassId);
  const currentClass = isAllClasses ? { name: 'All Classes' } : data.classes.find(c => c.id === activeClassId);

  // Helper to get combined records for selected date
  const getCombinedRecords = (date, classId) => {
    if (classId === 'ALL') {
      const combined = {};
      data.classes.forEach(c => {
        const rec = data.attendance[`${date}_${c.id}`]?.records || {};
        Object.assign(combined, rec);
      });
      return combined;
    }
    return data.attendance[`${date}_${classId}`]?.records || {};
  };

  // Local draft state for attendance
  const [records, setRecords] = useState(() => getCombinedRecords(selectedDate, activeClassId));
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  // Sync draft state if date or class changes
  React.useEffect(() => {
    setRecords(getCombinedRecords(selectedDate, activeClassId));
  }, [selectedDate, activeClassId, data.attendance]);

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
    if (activeClassId === 'ALL') {
      data.classes.forEach(c => {
        const classStudentIds = new Set(data.students.filter(s => s.classId === c.id).map(s => s.id));
        const classSpecificRecords = {};
        Object.entries(records).forEach(([stdId, status]) => {
          if (classStudentIds.has(stdId)) {
            classSpecificRecords[stdId] = status;
          }
        });
        if (Object.keys(classSpecificRecords).length > 0) {
          onSaveAttendance(selectedDate, c.id, classSpecificRecords);
        }
      });
    } else {
      onSaveAttendance(selectedDate, activeClassId, records);
    }
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  // Compute live stats for current sheet
  const totalCount = classStudents.length;
  const presentCount = Object.values(records).filter(v => v === 'Present').length;
  const absentCount = Object.values(records).filter(v => v === 'Absent').length;
  const lateCount = Object.values(records).filter(v => v === 'Late').length;

  const getAbsentMessage = (student) => {
    // Clean Urdu date format e.g. "15 ستمبر"
    const dateObj = new Date(selectedDate);
    const urduMonths = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];
    const day = !isNaN(dateObj) ? dateObj.getDate() : '';
    const monthUrdu = !isNaN(dateObj) ? urduMonths[dateObj.getMonth()] : '';
    const formattedDate = !isNaN(dateObj) ? `${day} ${monthUrdu}` : 'آج';

    // Find the student's actual enrolled class
    const studentClassObj = data.classes.find(c => c.id === student.classId);
    const studentClassName = studentClassObj ? studentClassObj.name : (currentClass && currentClass.name !== 'All Classes' ? currentClass.name : '');

    return `🌟 الضیاء سائنس اکیڈمی 🌟\nAl-Zia Science Academy\n\nمحترم والدین!\nالسلام علیکم ورحمۃ اللہ وبرکاتہ،\n\nآپ کو مطلع کیا جاتا ہے کہ آپ کا بچہ/بچی:\n\n👤 نام: ${student.name}\n🔢 رول نمبر: #${student.rollNo}\n🏫 کلاس: ${studentClassName || 'N/A'}\n📅 تاریخ: ${formattedDate}\n\nآج الضیاء سائنس اکیڈمی میں غیر حاضر (Absent) رہا/رہی ہے۔\n\nبراہِ کرم اپنے بچے/بچی کی باقاعدہ حاضری کو یقینی بنائیں تاکہ تعلیمی سرگرمیوں میں کسی قسم کا خلل نہ آئے۔\n\nآپ کے تعاون کا شکریہ۔\n\nانتظامیہ\nالضیاء سائنس اکیڈمی\nAl-Zia Science Academy\n+92 334 6683236`;
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

  return (
    <div className="space-y-5">
      
      {/* 1. Sleek Control & Class Filter Bar */}
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

            {isAdminLoggedIn ? (
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
            ) : (
              <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                <span>👁️ Read Only</span>
                <span className="text-[10px] text-slate-500">(Admin PIN required)</span>
              </div>
            )}
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
              {data.students.length}
            </span>
          </button>

          {data.classes.map(c => {
            const isSelected = activeClassId === c.id;
            const count = data.students.filter(s => s.classId === c.id).length;
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

      {/* 2. Distinct Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 p-3.5 rounded-2xl shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Students</span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{totalCount}</span>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/60 border border-emerald-500/20 p-3.5 rounded-2xl shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Present</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-300 font-mono">{presentCount}</span>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/60 border border-rose-500/20 p-3.5 rounded-2xl shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Absent</span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-300 font-mono">{absentCount}</span>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/60 border border-amber-500/20 p-3.5 rounded-2xl shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Late</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-300 font-mono">{lateCount}</span>
          </div>
        </div>
      </div>

      {/* 3. Class Attendance Register Table */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              {isAllClasses ? 'All Students Attendance Roster' : `Class ${currentClass?.name || ''} Attendance Roster`}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md font-mono bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 font-bold">
              {classStudents.length} Students
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Date: {selectedDate}</span>
        </div>

        {classStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
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
                {classStudents.map((student) => {
                  const currentStatus = records[student.id] || 'Present';
                  return (
                    <tr key={student.id} className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-indigo-700 dark:text-indigo-400 font-extrabold whitespace-nowrap">#{student.rollNo}</td>
                      {isAllClasses && (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
                            Class {data.classes.find(c => c.id === student.classId)?.name || 'N/A'}
                          </span>
                        </td>
                      )}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">{student.name}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">{student.fname || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-xs font-mono whitespace-nowrap">
                        {isAdminLoggedIn ? (
                          <span className="text-slate-600 dark:text-slate-300">{student.fatherNumber || student.parentContact || 'N/A'}</span>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">🔒 Admin Only</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isAdminLoggedIn ? (
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
                        ) : (
                          <div className="flex justify-center">
                            <span className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                              currentStatus === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              currentStatus === 'Absent' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {currentStatus === 'Present' && <CheckCircle2 className="w-3.5 h-3.5" />}
                              {currentStatus === 'Absent' && <XCircle className="w-3.5 h-3.5" />}
                              {currentStatus === 'Late' && <Clock className="w-3.5 h-3.5" />}
                              {currentStatus}
                            </span>
                          </div>
                        )}
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
            No students enrolled in {isAllClasses ? 'the academy' : `Class ${currentClass?.name || ''}`} yet. Go to <strong>Classes & Students</strong> tab to add students.
          </div>
        )}
      </div>

      {/* WhatsApp Absent SMS Preview Modal (Formatted in Jameel Noori Nastaleeq) */}
      {smsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
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

            {/* Message Box with Jameel Noori Nastaleeq font and RTL formatting */}
            <div className="relative">
              <div 
                dir="rtl"
                className="font-nastaleeq p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-500/30 text-slate-100 text-lg md:text-xl leading-loose shadow-inner select-text whitespace-pre-line text-right"
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
    </div>
  );
}
