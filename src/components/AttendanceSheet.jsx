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
  Lock
} from 'lucide-react';

export default function AttendanceSheet({ data, onSaveAttendance, selectedClassId, isAdminLoggedIn }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeClassId, setActiveClassId] = useState(selectedClassId !== 'ALL' ? selectedClassId : (data.classes[0]?.id || ''));

  if (!isAdminLoggedIn) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 my-8 shadow-2xl">
        <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Daily Attendance Management</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Daily attendance register is restricted and accessible to Admin only. Please click <strong className="text-indigo-400">Admin Login</strong> in the top right menu and enter your PIN to mark or view attendance.
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-400" />
            Class-Wise Daily Attendance Register
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Select a class, tap Present or Absent for each student, and save records permanently.
          </p>
        </div>

        {/* Date Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
            />
          </div>

          {/* Admin Attendance Controls */}
          {isAdminLoggedIn ? (
            <>
              <button
                onClick={handleMarkAllPresent}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Mark All Present
              </button>

              <button
                onClick={handleSave}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Attendance
              </button>
            </>
          ) : (
            <div className="px-3.5 py-2 bg-slate-800/80 border border-slate-700 text-slate-400 rounded-xl text-xs font-medium flex items-center gap-2">
              <span>👁️ Read Only</span>
              <span className="text-[10px] text-slate-500">(Admin PIN required to mark attendance)</span>
            </div>
          )}
        </div>
      </div>

      {/* Class Selection Tabs (9th, 10th, 11th, 12th) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-indigo-400" /> Select Class:
        </span>
        {data.classes.map(c => {
          const isSelected = activeClassId === c.id;
          const count = data.students.filter(s => s.classId === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setActiveClassId(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>Class {c.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {count} Students
              </span>
            </button>
          );
        })}
      </div>

      {/* Save Success Alert */}
      {isSavedAlert && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-center gap-3 text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Attendance recorded successfully for <strong>Class {currentClass?.name}</strong> on <strong>{selectedDate}</strong>!</span>
        </div>
      )}

      {/* Daily Live Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 text-center">
          <span className="text-xs text-slate-400 block font-medium">Total Students</span>
          <span className="text-xl font-bold text-white mt-1 block">{totalCount}</span>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
          <span className="text-xs text-emerald-400 block font-medium">Present</span>
          <span className="text-xl font-bold text-emerald-300 mt-1 block">{presentCount}</span>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
          <span className="text-xs text-rose-400 block font-medium">Absent</span>
          <span className="text-xl font-bold text-rose-300 mt-1 block">{absentCount}</span>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
          <span className="text-xs text-amber-400 block font-medium">Late</span>
          <span className="text-xl font-bold text-amber-300 mt-1 block">{lateCount}</span>
        </div>
      </div>

      {/* Class Attendance Register Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="font-bold text-white text-base flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-400" />
            Class {currentClass?.name || ''} Student Roster
          </span>
          <span className="text-xs text-slate-400 font-mono">Date: {selectedDate}</span>
        </div>

        {classStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold tracking-wider">
                  <th className="py-3.5 px-4">Roll #</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Father Name</th>
                  <th className="py-3.5 px-4">Father Number</th>
                  <th className="py-3.5 px-4 text-center">Attendance Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {classStudents.map((student) => {
                  const currentStatus = records[student.id] || 'Present';
                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-indigo-400 font-bold">#{student.rollNo}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{student.name}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-300">{student.fname || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-xs font-mono">
                        {isAdminLoggedIn ? (
                          <span className="text-slate-300">{student.fatherNumber || student.parentContact || 'N/A'}</span>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">🔒 Admin Only</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isAdminLoggedIn ? (
                          <div className="flex items-center justify-center gap-2">
                            
                            {/* Present Button */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'Present')}
                              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                currentStatus === 'Present'
                                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" /> Present
                            </button>

                            {/* Absent Button */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'Absent')}
                              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                currentStatus === 'Absent'
                                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105'
                                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                              }`}
                            >
                              <XCircle className="w-4 h-4" /> Absent
                            </button>

                            {/* Late Button */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'Late')}
                              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                currentStatus === 'Late'
                                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105'
                                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                              }`}
                            >
                              <Clock className="w-4 h-4" /> Late
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
                                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer"
                                title="Send WhatsApp Absent Alert to Parent"
                              >
                                💬 WA Alert
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
