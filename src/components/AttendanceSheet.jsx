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
  Sparkles
} from 'lucide-react';

export default function AttendanceSheet({ data, onSaveAttendance, selectedClassId, isAdminLoggedIn }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeClassId, setActiveClassId] = useState(selectedClassId !== 'ALL' ? selectedClassId : (data.classes[0]?.id || ''));

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

  // Get students for selected class
  const classStudents = data.students.filter(s => s.classId === activeClassId);
  const currentClass = data.classes.find(c => c.id === activeClassId);

  // Key for storage: `${date}_${classId}`
  const attendanceKey = `${selectedDate}_${activeClassId}`;
  const existingRecord = data.attendance[attendanceKey]?.records || {};

  // Local draft state for attendance
  const [records, setRecords] = useState(existingRecord);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  // Sync draft state if date or class changes
  React.useEffect(() => {
    setRecords(data.attendance[`${selectedDate}_${activeClassId}`]?.records || {});
  }, [selectedDate, activeClassId, data.attendance]);

  const handleStatusChange = (studentId, status) => {
    setRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const allPresent = {};
    classStudents.forEach(s => {
      allPresent[s.id] = 'Present';
    });
    setRecords(allPresent);
  };

  const handleSave = () => {
    onSaveAttendance(selectedDate, activeClassId, records);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  // Compute live stats for current sheet
  const totalCount = classStudents.length;
  const presentCount = Object.values(records).filter(v => v === 'Present').length;
  const absentCount = Object.values(records).filter(v => v === 'Absent').length;
  const lateCount = Object.values(records).filter(v => v === 'Late').length;

  return (
    <div className="space-y-6">
      
      {/* Top Action Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 glass-panel glow-accent-indigo p-6 rounded-2xl shadow-xl overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-500 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Al-Zia Science Academy Daily Roll Call
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ClipboardCheck className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            Class-Wise Daily Attendance Register
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Select a class, tap Present or Absent for each student, and save records permanently.
          </p>
        </div>

        {/* Date Selector & Action Buttons arranged neatly in a single cohesive row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
          
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 shadow-xs">
            <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold sm:hidden">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            />
          </div>

          {/* Admin Attendance Controls */}
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleMarkAllPresent}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                title="Mark all active class students as Present"
              >
                <UserCheck className="w-4 h-4 text-white" />
                <span>Mark All Present</span>
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                title="Save attendance records to cloud database"
              >
                <Save className="w-4 h-4 text-white" />
                <span>Save Attendance</span>
              </button>
            </div>
          ) : (
            <div className="px-3.5 py-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span>👁️ Read Only</span>
              <span className="text-[10px] text-slate-500">(Admin PIN required to mark attendance)</span>
            </div>
          )}
        </div>
      </div>

      {/* Class Selection Tabs (9th, 10th, 11th, 12th) */}
      <div className="bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-sm">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mr-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Select Class:
        </span>
        {data.classes.map(c => {
          const isSelected = activeClassId === c.id;
          const count = data.students.filter(s => s.classId === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setActiveClassId(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm'
              }`}
            >
              <span>Class {c.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${isSelected ? 'bg-indigo-950/60 text-indigo-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                {count} Students
              </span>
            </button>
          );
        })}
      </div>

      {/* Save Success Alert */}
      {isSavedAlert && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 p-4 rounded-xl flex items-center gap-3 text-sm animate-fade-in font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Attendance recorded successfully for <strong>Class {currentClass?.name}</strong> on <strong>{selectedDate}</strong>!</span>
        </div>
      )}

      {/* Daily Live Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-3.5 text-center rounded-2xl">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Total Students</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block font-mono">{totalCount}</span>
        </div>
        <div className="glass-card glow-accent-emerald p-3.5 text-center rounded-2xl border-emerald-500/30 overflow-hidden">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-semibold">Present</span>
          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-300 mt-1 block font-mono">{presentCount}</span>
        </div>
        <div className="glass-card p-3.5 text-center rounded-2xl border-rose-500/30 overflow-hidden">
          <span className="text-xs text-rose-600 dark:text-rose-400 block font-semibold">Absent</span>
          <span className="text-xl font-extrabold text-rose-600 dark:text-rose-300 mt-1 block font-mono">{absentCount}</span>
        </div>
        <div className="glass-card glow-accent-amber p-3.5 text-center rounded-2xl border-amber-500/30 overflow-hidden">
          <span className="text-xs text-amber-600 dark:text-amber-400 block font-semibold">Late</span>
          <span className="text-xl font-extrabold text-amber-600 dark:text-amber-300 mt-1 block font-mono">{lateCount}</span>
        </div>
      </div>

      {/* Class Attendance Register Table */}
      <div className="glass-panel glow-accent-indigo rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-900/90 flex items-center justify-between">
          <span className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            Class {currentClass?.name || ''} Student Roster
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Date: {selectedDate}</span>
        </div>

        {classStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                  <th className="py-3.5 px-4 whitespace-nowrap">Roll #</th>
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
                                onClick={() => {
                                  const parentPhone = student.fatherNumber || student.parentContact;
                                  if (!parentPhone) {
                                    alert(`Parent phone number not found for ${student.name}`);
                                    return;
                                  }
                                  let cleanPhone = parentPhone.replace(/[^0-9]/g, '');
                                  if (cleanPhone.startsWith('0')) {
                                    cleanPhone = '92' + cleanPhone.slice(1);
                                  }
                                  
                                  // Clean date format e.g. "17 August" without year number
                                  const dateObj = new Date(selectedDate);
                                  const formattedDate = !isNaN(dateObj) 
                                    ? dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })
                                    : 'today';

                                  const msg = `Respected Parent, Your child *${student.name}* (Roll #${student.rollNo}, Class ${currentClass?.name}) was *ABSENT* today (${formattedDate}) at Al-Zia Science Academy. Kindly ensure regular attendance. - Al-Zia Science Academy`;
                                  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                                }}
                                className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                                title="Send WhatsApp Absent Alert to Parent"
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
            No students enrolled in Class {currentClass?.name || ''} yet. Go to <strong>Classes & Students</strong> tab to add students.
          </div>
        )}
      </div>
    </div>
  );
}
