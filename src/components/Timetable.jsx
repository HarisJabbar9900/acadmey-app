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
  X,
  RotateCcw,
  Printer
} from 'lucide-react';
import { DEFAULT_TIMETABLE } from '../services/academyService';

const isOutdatedTimetable = (list) => {
  if (!Array.isArray(list) || list.length === 0) return true;
  return list.some(row => 
    !row || 
    !row.boys || 
    row.boys === 'Subject' ||
    JSON.stringify(row).includes('Combined') || 
    JSON.stringify(row).toLowerCase().includes('jalab')
  );
};

export default function Timetable({ timetable = [], selectedClassId, isAdminLoggedIn, onSaveTimetable }) {
  const [filterClass, setFilterClass] = useState('ALL');
  const [isEditing, setIsEditing] = useState(false);
  const effectiveTimetable = isOutdatedTimetable(timetable) ? DEFAULT_TIMETABLE : timetable;
  const [draftRows, setDraftRows] = useState(effectiveTimetable);
  const [saveAlert, setSaveAlert] = useState(false);

  // Sync draft rows when props timetable updates, or auto-upgrade if outdated
  useEffect(() => {
    if (isOutdatedTimetable(timetable)) {
      setDraftRows(DEFAULT_TIMETABLE);
      if (typeof onSaveTimetable === 'function') {
        onSaveTimetable(DEFAULT_TIMETABLE);
      }
    } else if (!isEditing) {
      setDraftRows(timetable);
    }
  }, [timetable, isEditing]);

  const handleCellChange = (index, field, value) => {
    const updated = [...draftRows];
    updated[index] = { ...updated[index], [field]: value };
    setDraftRows(updated);
  };

  const handleAddRow = () => {
    const newRow = {
      id: 'tt-' + Date.now(),
      time: '6:30 – 7:00 PM',
      '9th': 'Subject',
      '10th': 'Subject',
      '11th': 'Subject',
      '12th': 'Subject',
      boys: 'Subject'
    };
    setDraftRows(prev => [...prev, newRow]);
  };

  const handleDeleteRow = (index) => {
    setDraftRows(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset timetable to official Al-Zia Science Academy V5 schedule?')) {
      setDraftRows(DEFAULT_TIMETABLE);
    }
  };

  const handleSaveAll = () => {
    onSaveTimetable(draftRows);
    setIsEditing(false);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 3000);
  };

  const handleCancel = () => {
    setDraftRows(timetable && timetable.length > 0 ? timetable : DEFAULT_TIMETABLE);
    setIsEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const getSubjectBadgeStyle = (subject = '') => {
    const s = (subject || '').trim();
    if (!s || s === '-') {
      return 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-dashed border-slate-300 dark:border-slate-700/60 font-medium';
    }
    if (s.includes('Quran')) {
      return 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 font-semibold';
    }
    if (s.includes('Math')) {
      return 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30 font-semibold';
    }
    if (s.includes('Physics')) {
      return 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30 font-semibold';
    }
    if (s.includes('Chemistry') || s.includes('Chem')) {
      return 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30 font-semibold';
    }
    if (s.includes('Bio') || s.includes('Biologi')) {
      return 'bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-500/30 font-semibold';
    }
    if (s.includes('Comp')) {
      return 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 font-semibold';
    }
    if (s.includes('English')) {
      return 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 font-semibold';
    }
    if (s.includes('Urdu')) {
      return 'bg-pink-50 dark:bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-500/30 font-semibold';
    }
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium';
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel glow-accent-indigo p-6 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 overflow-hidden print:shadow-none print:border-none print:p-2">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Official Class Schedule & Timetable (V5)
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Al-Zia Science Academy Timetable
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Daily Academy Timing: <strong className="text-slate-900 dark:text-white">3:00 PM – 6:30 PM</strong> | 6 Periods Scheduled
          </p>
        </div>

        {/* Filter Buttons & Admin Actions */}
        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          
          {/* Filter Badges */}
          {!isEditing && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0 mr-1">Class View:</span>
              {[
                { key: 'ALL', label: 'All Classes' },
                { key: '9th', label: '9th Class' },
                { key: '10th', label: '10th Class' },
                { key: '11th', label: '11th (1st Year)' },
                { key: '12th', label: '12th (2nd Year)' },
                { key: 'boys', label: 'Boys' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterClass(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    filterClass === key
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Print Button */}
          {!isEditing && (
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Print Official Timetable"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-500" />
              <span>Print</span>
            </button>
          )}

          {/* Admin Edit Controls */}
          {isAdminLoggedIn ? (
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddRow}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    + Add Slot
                  </button>

                  <button
                    onClick={handleResetToDefault}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="Restore Official V5 Schedule"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset V5
                  </button>

                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>

                  <button
                    onClick={handleSaveAll}
                    className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Timetable
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Timetable
                </button>
              )}
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <span>👁️ Read Only</span>
              <span className="text-[10px] text-slate-500">(Admin PIN required)</span>
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
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            Class Schedule Matrix {isEditing ? '(EDIT MODE)' : ''}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">{draftRows.length} Periods Scheduled</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/60 text-slate-700 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-4 w-36 border-r border-slate-200 dark:border-slate-800">Time Slot</th>
                {(isEditing || filterClass === 'ALL' || filterClass === '9th') && (
                  <th className="py-4 px-4 text-center border-r border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-300">9th Class</th>
                )}
                {(isEditing || filterClass === 'ALL' || filterClass === '10th') && (
                  <th className="py-4 px-4 text-center border-r border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-300">10th Class</th>
                )}
                {(isEditing || filterClass === 'ALL' || filterClass === '11th') && (
                  <th className="py-4 px-4 text-center border-r border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-300">11th (1st Year)</th>
                )}
                {(isEditing || filterClass === 'ALL' || filterClass === '12th') && (
                  <th className="py-4 px-4 text-center border-r border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-300">12th (2nd Year)</th>
                )}
                {(isEditing || filterClass === 'ALL' || filterClass === 'boys') && (
                  <th className="py-4 px-4 text-center border-r border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-300">Boys</th>
                )}
                {isEditing && (
                  <th className="py-4 px-2 text-center text-rose-500 dark:text-rose-400 w-12">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              {draftRows.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  
                  {/* Time Slot Cell */}
                  <td className="py-3 px-4 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-slate-50/50 dark:bg-slate-950/30 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={row.time || ''}
                        onChange={(e) => handleCellChange(idx, 'time', e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        {row.time}
                      </div>
                    )}
                  </td>

                  {/* 9th Class Cell */}
                  {(isEditing || filterClass === 'ALL' || filterClass === '9th') && (
                    <td className="py-3 px-3 text-center border-r border-slate-200 dark:border-slate-800/60">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row['9th'] || ''}
                          onChange={(e) => handleCellChange(idx, '9th', e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 text-center"
                        />
                      ) : (
                        <span className={`inline-block px-3 py-1.5 rounded-xl text-xs border ${getSubjectBadgeStyle(row['9th'])}`}>
                          {row['9th'] || '-'}
                        </span>
                      )}
                    </td>
                  )}

                  {/* 10th Class Cell */}
                  {(isEditing || filterClass === 'ALL' || filterClass === '10th') && (
                    <td className="py-3 px-3 text-center border-r border-slate-200 dark:border-slate-800/60">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row['10th'] || ''}
                          onChange={(e) => handleCellChange(idx, '10th', e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 text-center"
                        />
                      ) : (
                        <span className={`inline-block px-3 py-1.5 rounded-xl text-xs border ${getSubjectBadgeStyle(row['10th'])}`}>
                          {row['10th'] || '-'}
                        </span>
                      )}
                    </td>
                  )}

                  {/* 11th Class Cell */}
                  {(isEditing || filterClass === 'ALL' || filterClass === '11th') && (
                    <td className="py-3 px-3 text-center border-r border-slate-200 dark:border-slate-800/60">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row['11th'] || ''}
                          onChange={(e) => handleCellChange(idx, '11th', e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 text-center"
                        />
                      ) : (
                        <span className={`inline-block px-3 py-1.5 rounded-xl text-xs border ${getSubjectBadgeStyle(row['11th'])}`}>
                          {row['11th'] || '-'}
                        </span>
                      )}
                    </td>
                  )}

                  {/* 12th Class Cell */}
                  {(isEditing || filterClass === 'ALL' || filterClass === '12th') && (
                    <td className="py-3 px-3 text-center border-r border-slate-200 dark:border-slate-800/60">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row['12th'] || ''}
                          onChange={(e) => handleCellChange(idx, '12th', e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 text-center"
                        />
                      ) : (
                        <span className={`inline-block px-3 py-1.5 rounded-xl text-xs border ${getSubjectBadgeStyle(row['12th'])}`}>
                          {row['12th'] || '-'}
                        </span>
                      )}
                    </td>
                  )}

                  {/* Boys Class Cell */}
                  {(isEditing || filterClass === 'ALL' || filterClass === 'boys') && (
                    <td className={`py-3 px-3 text-center ${isEditing ? 'border-r border-slate-200 dark:border-slate-800/60' : ''}`}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={row.boys || ''}
                          onChange={(e) => handleCellChange(idx, 'boys', e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 text-center"
                        />
                      ) : (
                        <span className={`inline-block px-3 py-1.5 rounded-xl text-xs border ${getSubjectBadgeStyle(row.boys)}`}>
                          {row.boys || '-'}
                        </span>
                      )}
                    </td>
                  )}

                  {/* Admin Row Delete Action */}
                  {isEditing && (
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleDeleteRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
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

        {/* Portal Footer Tag */}
        <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">
            Al-Zia Science Academy • Online Management Portal
          </p>
        </div>
      </div>

    </div>
  );
}
