import React, { useState } from 'react';
import { 
  Award, 
  PlusCircle, 
  BookOpen, 
  Calendar, 
  Save, 
  CheckCircle2, 
  Layers,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';

export default function MarksLedger({ data, onAddTest, onDeleteTest, selectedClassId, isAdminLoggedIn }) {
  const [activeClassId, setActiveClassId] = useState(selectedClassId !== 'ALL' ? selectedClassId : (data.classes[0]?.id || ''));
  const [modalClassId, setModalClassId] = useState(selectedClassId !== 'ALL' ? selectedClassId : (data.classes[0]?.id || ''));
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for creating a new test
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [maxMarks, setMaxMarks] = useState(50);
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [scores, setScores] = useState({});

  // Sync modalClassId if activeClassId changes
  React.useEffect(() => {
    if (activeClassId) setModalClassId(activeClassId);
  }, [activeClassId]);

  const currentClass = data.classes.find(c => c.id === activeClassId);
  const classStudents = data.students.filter(s => s.classId === activeClassId);
  const classTests = data.tests.filter(t => t.classId === activeClassId);

  const modalCurrentClass = data.classes.find(c => c.id === modalClassId);
  const modalClassStudents = data.students.filter(s => s.classId === modalClassId);

  const handleScoreChange = (studentId, value) => {
    setScores(prev => ({
      ...prev,
      [studentId]: value === '' ? '' : Math.min(Number(maxMarks), Math.max(0, Number(value)))
    }));
  };

  const handleCreateTest = (e) => {
    e.preventDefault();
    if (!title || !subject || !maxMarks || !modalClassId) return;

    const monthStr = testDate.substring(0, 7); // "YYYY-MM"
    const newTest = {
      id: 'tst-' + Date.now(),
      classId: modalClassId,
      title,
      subject,
      maxMarks: Number(maxMarks),
      date: testDate,
      month: monthStr,
      scores
    };

    onAddTest(newTest);
    setIsModalOpen(false);

    // Reset Form
    setTitle('');
    setSubject('');
    setMaxMarks(50);
    setScores({});
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            Subject Tests & Marks Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create tests, input student marks, and automatically calculate monthly score totals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Class Select */}
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
            <span className="text-xs text-slate-400 font-medium">Class:</span>
            <select
              value={activeClassId}
              onChange={(e) => setActiveClassId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
            >
              {data.classes.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Create Test Button */}
          {isAdminLoggedIn ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Create New Test
            </button>
          ) : (
            <div className="px-3.5 py-2 bg-slate-800/80 border border-slate-700 text-slate-400 rounded-xl text-xs font-medium flex items-center gap-2">
              <span>👁️ Read Only</span>
            </div>
          )}
        </div>
      </div>

      {/* Tests List Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Recent Tests ({currentClass?.name || 'Selected Class'})
        </h3>

        {classTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classTests.map((test) => (
              <div key={test.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                        {test.subject}
                      </span>
                      <h4 className="text-lg font-bold text-white mt-2">{test.title}</h4>
                    </div>
                    {isAdminLoggedIn && (
                      <button
                        onClick={() => onDeleteTest(test.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Test"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> {test.date}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                      <Award className="w-3.5 h-3.5 text-amber-400" /> Max Marks: {test.maxMarks}
                    </span>
                  </div>
                </div>

                {/* Score Summary breakdown */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 bg-slate-950/40 rounded-xl p-3">
                  <div className="text-xs font-semibold text-slate-300 mb-2">Student Marks List:</div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
                    {classStudents.map(student => {
                      const score = test.scores ? test.scores[student.id] : undefined;
                      const percentage = score !== undefined && Number(test.maxMarks) > 0 ? Math.round((Number(score) / Number(test.maxMarks)) * 100) : 0;
                      return (
                        <div key={student.id} className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/40 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{student.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">(#{student.rollNo})</span>
                          </div>

                          {score !== undefined ? (
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-xs text-white">
                                <strong className="text-indigo-400 font-bold">{score}</strong> / {test.maxMarks}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                percentage >= 80 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                percentage >= 60 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                                percentage >= 40 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}>
                                {percentage}%
                              </span>

                              {/* WhatsApp Parent Score Notification */}
                              {isAdminLoggedIn && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const parentPhone = student.fatherNumber || student.parentContact;
                                    if (!parentPhone) {
                                      alert(`Parent contact number not found for ${student.name}`);
                                      return;
                                    }
                                    let cleanPhone = parentPhone.replace(/[^0-9]/g, '');
                                    if (cleanPhone.startsWith('0')) {
                                      cleanPhone = '92' + cleanPhone.slice(1);
                                    }
                                    const msg = `Respected Parent, Result of *${test.subject}* Test for *${student.name}* (Roll #${student.rollNo}): Marks Obtained: *${score}/${test.maxMarks}* (${percentage}%). - Al-Zia Science Academy`;
                                    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                                  }}
                                  className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                                  title="Send Test Score via WhatsApp to Parent"
                                >
                                  💬
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">Not evaluated</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            No tests created for this class yet. Click "Create New Test" to add subject marks.
          </div>
        )}
      </div>

      {/* Modal: Create Test */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-auto max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                Add New Test Marks
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-4">
              
              {/* Target Class Selection */}
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1">Target Class *</label>
                <select
                  value={modalClassId}
                  onChange={(e) => {
                    setModalClassId(e.target.value);
                    setScores({}); // reset draft scores on class change
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {data.classes.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      Class {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Test Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chapter 1 Quiz"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    list="subject-suggestions"
                    placeholder="e.g. Physics, Math, Computer..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <datalist id="subject-suggestions">
                    <option value="Computer Science" />
                    <option value="Physics" />
                    <option value="Chemistry" />
                    <option value="Math" />
                    <option value="English" />
                    <option value="Urdu" />
                    <option value="Biology" />
                    <option value="Islamic Studies" />
                    <option value="Pak Studies" />
                    <option value="Quran Pak" />
                  </datalist>

                  {/* Quick Click Badges (Class Specific) */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(modalCurrentClass?.subjects || ['Physics', 'Chemistry', 'Math', 'Computer Science', 'English', 'Urdu', 'Biology', 'Quran Pak']).map(sub => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setSubject(sub)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                          subject === sub
                            ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        + {sub}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-indigo-300 mb-1">
                    🎯 Class Test Total Marks <span className="text-[10px] text-slate-400 font-normal">(Same for all students)</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50 or 100"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    className="w-full bg-slate-800 border border-indigo-500/50 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Test Date</label>
                  <input
                    type="date"
                    required
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Student Marks Entry List */}
              <div className="pt-2">
                <div className="bg-indigo-950/40 border border-indigo-900/50 p-2.5 rounded-xl mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Students in <strong>Class {modalCurrentClass?.name}</strong></span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-normal">
                      {modalClassStudents.length} Students
                    </span>
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    Total Test Marks: {maxMarks || 0}
                  </span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 max-h-56 overflow-y-auto space-y-2.5">
                  {modalClassStudents.length > 0 ? (
                    modalClassStudents.map(student => {
                      const currentScore = scores[student.id];
                      const hasScore = currentScore !== undefined && currentScore !== '';
                      const percentage = hasScore && Number(maxMarks) > 0 
                        ? Math.round((Number(currentScore) / Number(maxMarks)) * 100) 
                        : null;

                      return (
                      <div key={student.id} className="flex items-center justify-between gap-3 text-xs bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                        <div className="flex flex-col">
                          <span className="text-white font-bold">{student.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Roll #{student.rollNo} • {student.fname}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Live Percentage Badge */}
                          {percentage !== null && (
                            <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                              percentage >= 80 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              percentage >= 60 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                              percentage >= 40 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {percentage}%
                            </span>
                          )}

                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max={maxMarks}
                              placeholder="0"
                              value={scores[student.id] ?? ''}
                              onChange={(e) => handleScoreChange(student.id, e.target.value)}
                              className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono font-bold focus:outline-none focus:border-indigo-500 text-right text-xs"
                            />
                            <span className="text-[11px] text-slate-500 font-mono">/ {maxMarks}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500 italic">
                    No students enrolled in Class {modalCurrentClass?.name} yet.
                  </div>
                )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Save Test Marks
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
