import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Sparkles, 
  Edit3, 
  Save, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  X 
} from 'lucide-react';

export default function Timetable({ timetable = [], selectedClassId, isAdminLoggedIn, onSaveTimetable }) {
  const [filterClass, setFilterClass] = useState('ALL');
  const [isEditing, setIsEditing] = useState(false);
  const [draftRows, setDraftRows] = useState(timetable);
  const [saveAlert, setSaveAlert] = useState(false);

  // Sync draft rows when props timetable updates (only when not editing)
  useEffect(() => {
    if (!isEditing && timetable && timetable.length > 0) {
      setDraftRows(timetable);
    }
  }, [timetable?.length, isEditing]);

  const handleCellChange = (index, field, value) => {
    const updated = [...draftRows];
    updated[index] = { ...updated[index], [field]: value };
    setDraftRows(updated);
  };

  const handleAddRow = () => {
    const newRow = {
      id: 'tt-' + Date.now(),
      time: '6:30 - 7:00',
      '9th': 'Subject',
      '10th': 'Subject',
      '11th': 'Subject',
      '12th': 'Subject'
    };
    setDraftRows(prev => [...prev, newRow]);
  };

  const handleDeleteRow = (index) => {
    setDraftRows(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveAll = () => {
    onSaveTimetable(draftRows);
    setIsEditing(false);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 3000);
  };

  const handleCancel = () => {
    setDraftRows(timetable);
    setIsEditing(false);
  };

  const getSubjectBadgeStyle = (subject = '') => {
    if (subject.includes('Combined')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold shadow-sm shadow-amber-500/10';
    if (subject.includes('Quran')) return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 font-bold';
    if (subject.includes('Math')) return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
    if (subject.includes('Physics')) return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
    if (subject.includes('Chemistry')) return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
    if (subject.includes('Bio/Comp')) return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
    if (subject.includes('English')) return 'bg-sky-500/10 text-sky-300 border-sky-500/30';
    if (subject.includes('Urdu')) return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel glow-accent-indigo p-6 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-500 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Official Schedule
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Al-Zia Science Academy Timetable
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Daily Academy Timing: <strong className="text-slate-900 dark:text-white">3:00 PM - 6:30 PM</strong>
          </p>
        </div>

        {/* Filter Buttons & Admin Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Filter Badges */}
          {!isEditing && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">Class View:</span>
              {['ALL', '9th', '10th', '11th', '12th'].map(clsKey => (
                <button
                  key={clsKey}
                  onClick={() => setFilterClass(clsKey)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    filterClass === clsKey
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs'
                  }`}
                >
                  {clsKey === 'ALL' ? 'All Classes' : clsKey === '11th' ? '11th (1st Year)' : clsKey === '12th' ? '12th (2nd Year)' : `Class ${clsKey}`}
                </button>
              ))}
            </div>
          )}

          {/* Admin Edit Controls */}
          {isAdminLoggedIn ? (
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddRow}
                    className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    + Add Slot
                  </button>

                  <button
                    onClick={handleCancel}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>

                  <button
                    onClick={handleSaveAll}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Save Timetable
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Timetable
                </button>
              )}
            </div>
          ) : (
            <div className="px-3.5 py-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
              <span>👁️ Read Only</span>
              <span className="text-[10px] text-slate-500">(Admin PIN required to edit schedule)</span>
            </div>
          )}

        </div>
      </div>

      {/* Save Success Alert */}
      {saveAlert && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl flex items-center gap-3 text-sm animate-fade-in font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Timetable updated and saved to Cloud Firestore successfully!</span>
        </div>
      )}

      {/* Main Timetable Matrix */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Class Schedule Matrix {isEditing ? '(EDIT MODE)' : ''}
          </h3>
          <span className="text-xs text-slate-400 font-mono">{draftRows.length} Periods Scheduled</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-4 w-36 border-r border-slate-800">Time Slot</th>
                {(isEditing || filterClass === 'ALL' || filterClass === '9th') && (
                  <th className="py-4 px-4 text-center border-r border-slate-800 text-indigo-300">9th Class</th>
                )}
                {(isEditing || filterClass === 'ALL' || filterClass === '10th') && (
                  <th className="py-4 px-4 text-center border-r border-slate-800 text-indigo-300">10th Class</th>
                )}
                {(isEditing || filterClass === 'ALL' || filterClass === '11th') && (
                  <th className="py-4 px-4 text-center border-r border-slate-800 text-indigo-300">11th (1st Year)</th>
                )}
                {(isEditing || filterClass === 'ALL' || filterClass === '12th') && (
                  <th className="py-4 px-4 text-center border-r border-slate-800 text-indigo-300">12th (2nd Year)</th>
                )}
                {isEditing && (
                  <th className="py-4 px-2 text-center text-rose-400 w-12">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {draftRows.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-slate-800/30 transition-colors">
                  
                  {/* Time Slot Cell */}
                  <td className="py-3 px-4 font-mono text-xs font-bold text-indigo-400 bg-slate-950/30 border-r border-slate-800 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={row.time || ''}
                        onChange={(e) => handleCellChange(idx, 'time', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {row.time}
                      </div>
                    )}
                  </td>

                  {/* 9th Class Cell */}
                  {(isEditing || filterClass === 'ALL' || filterClass === '9th') && (
                    <td className="py-3 px-3 text-center border-r border-slate-800/60">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row['9th'] || ''}
                          onChange={(e) => handleCellChange(idx, '9th', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-indigo-500 text-center"
                        />
                      ) : (
                        <span className={`inline-block px-3 py-1.5 rounded-xl text-xs border font-medium ${getSubjectBadgeStyle(row['9th'])}`}>
                          {row['9th']}
                        </span>
                      )}
                    </td>
                  )}

                  {/* 10th Class Cell */}
                  {(isEditing || filterClass === 'ALL' || filterClass === '10th') && (
                    <td className="py-3 px-3 text-center border-r border-slate-800/60">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row['10th'] || ''}
                          onChange={(e) => handleCellChange(idx, '10th', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-indigo-500 text-center"
                        />
                      ) : (
                        <span className={`inline-block px-3 py-1.5 rounded-xl text-xs border font-medium ${getSubjectBadgeStyle(row['10th'])}`}>
                          {row['10th']}
                        </span>
                      )}
                    </td>
                  )}

                  {/* 11th Class Cell */}
                  {(isEditing || filterClass === 'ALL' || filterClass === '11th') && (
                    <td className="py-3 px-3 text-center border-r border-slate-800/60">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row['11th'] || ''}
                          onChange={(e) => handleCellChange(idx, '11th', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-indigo-500 text-center"
                        />
                      ) : (
                        <span className={`inline-block px-3 py-1.5 rounded-xl text-xs border font-medium ${getSubjectBadgeStyle(row['11th'])}`}>
                          {row['11th']}
                        </span>
                      )}
                    </td>
                  )}

                  {/* 12th Class Cell */}
                  {(isEditing || filterClass === 'ALL' || filterClass === '12th') && (
                    <td className={`py-3 px-3 text-center ${isEditing ? 'border-r border-slate-800/60' : ''}`}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={row['12th'] || ''}
                          onChange={(e) => handleCellChange(idx, '12th', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-indigo-500 text-center"
                        />
                      ) : (
                        <span className={`inline-block px-3 py-1.5 rounded-xl text-xs border font-medium ${getSubjectBadgeStyle(row['12th'])}`}>
                          {row['12th']}
                        </span>
                      )}
                    </td>
                  )}

                  {/* Admin Row Delete Action */}
                  {isEditing && (
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleDeleteRow(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Period Slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
