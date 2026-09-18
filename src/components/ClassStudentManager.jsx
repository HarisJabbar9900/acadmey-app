import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, 
  UserPlus, 
  FolderPlus, 
  Trash2, 
  Edit3, 
  Search, 
  Phone, 
  GraduationCap,
  Layers,
  Filter,
  CheckCircle2,
  BookOpen,
  Plus,
  X,
  Edit2,
  Printer,
  Contact,
  Sparkles
} from 'lucide-react';
import ReportCardModal from './ReportCardModal';
import BatchReportCardModal from './BatchReportCardModal';
import IdCardModal from './IdCardModal';

export default function ClassStudentManager({ 
  data, 
  selectedClassId, 
  isAdminLoggedIn,
  onAddClass, 
  onUpdateClass,
  onDeleteClass, 
  onAddStudent, 
  onUpdateStudent, 
  onDeleteStudent 
}) {
  const [selectedReportStudent, setSelectedReportStudent] = useState(null);
  const [selectedIdCardStudent, setSelectedIdCardStudent] = useState(null);
  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState(false);
  // Class Filter State inside the component (defaults to global selectedClassId or 'ALL')
  const [filterClassId, setFilterClassId] = useState(selectedClassId || 'ALL');

  // Modal states
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isManageClassesModalOpen, setIsManageClassesModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); // student object when editing
  
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  // Subject Management States
  const [newSubjectName, setNewSubjectName] = useState('');
  const [editingSubjectIndex, setEditingSubjectIndex] = useState(null);
  const [editingSubjectText, setEditingSubjectText] = useState('');

  // Add Class Form State
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('');

  // Class Edit / Delete States
  const [editingClass, setEditingClass] = useState(null);
  const [editClassName, setEditClassName] = useState('');
  const [editClassSubject, setEditClassSubject] = useState('');

  const handleOpenEditClass = (classObj) => {
    setEditingClass(classObj);
    setEditClassName(classObj.name || '');
    setEditClassSubject(classObj.subject || '');
  };

  const handleSaveEditClass = (e) => {
    e.preventDefault();
    if (!editingClass || !editClassName.trim()) return;

    const updatedClass = {
      ...editingClass,
      name: editClassName.trim(),
      subject: editClassSubject.trim() || `${editClassName.trim()} Batch`
    };

    if (onUpdateClass) {
      onUpdateClass(updatedClass);
    }
    setEditingClass(null);
    setNotification(`Class updated to "${editClassName.trim()}" successfully!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteClassWithConfirm = (classObj) => {
    const studentCount = data.students.filter(s => s.classId === classObj.id).length;
    const confirmMessage = studentCount > 0
      ? `Are you sure you want to delete "Class ${classObj.name}"? This will also remove ${studentCount} enrolled student(s) in this class!`
      : `Are you sure you want to delete "Class ${classObj.name}"?`;

    if (window.confirm(confirmMessage)) {
      if (onDeleteClass) {
        onDeleteClass(classObj.id);
      }
      if (filterClassId === classObj.id) {
        setFilterClassId('ALL');
      }
      setNotification(`Class "${classObj.name}" deleted successfully!`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Add Student Form State
  const [name, setName] = useState('');
  const [fname, setFname] = useState('');
  const [fatherNumber, setFatherNumber] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [targetClassId, setTargetClassId] = useState(data.classes[0]?.id || '');

  // Edit Student Form State
  const [editName, setEditName] = useState('');
  const [editFname, setEditFname] = useState('');
  const [editFatherNumber, setEditFatherNumber] = useState('');
  const [editRollNo, setEditRollNo] = useState('');
  const [editTargetClassId, setEditTargetClassId] = useState('');

  // Open Edit Modal & Populate Form
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setEditName(student.name || '');
    setEditFname(student.fname || '');
    setEditFatherNumber(student.fatherNumber || '');
    setEditRollNo(student.rollNo || '');
    setEditTargetClassId(student.classId || data.classes[0]?.id || '');
  };

  // Submit Add Class
  const handleCreateClass = (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newClass = {
      id: 'cls-' + Date.now(),
      name: newClassName.trim(),
      subject: newClassSubject.trim() || `${newClassName.trim()} Batch`,
      subjects: ['Physics', 'Chemistry', 'Math', 'Computer Science', 'English', 'Urdu']
    };

    onAddClass(newClass);
    const addedName = newClassName.trim();
    setNewClassName('');
    setNewClassSubject('');
    setIsClassModalOpen(false);
    setNotification(`New Class "${addedName}" added successfully!`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Subject Handlers
  const handleAddSubjectToClass = (e, classObj) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const rawInput = (newSubjectName || '').trim();
    if (!rawInput || !classObj) return;

    // Get current subjects array safely
    const currentSubjects = Array.isArray(classObj.subjects) 
      ? [...classObj.subjects] 
      : ['Physics', 'Chemistry', 'Math', 'Computer Science', 'Biology', 'Urdu'];

    // Check if subject already exists (case-insensitive)
    const alreadyExists = currentSubjects.some(
      s => s.trim().toLowerCase() === rawInput.toLowerCase()
    );

    if (alreadyExists) {
      setNotification(`Subject "${rawInput}" already exists in Class ${classObj.name}!`);
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const updatedSubjects = [...currentSubjects, rawInput];
    const updatedClass = { ...classObj, subjects: updatedSubjects };

    if (typeof onUpdateClass === 'function') {
      onUpdateClass(updatedClass);
    }
    setNewSubjectName('');
    setNotification(`Subject "${rawInput}" added successfully to Class ${classObj.name}!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRenameSubject = (classObj, index, newName) => {
    const trimmed = (newName || '').trim();
    if (!trimmed || !classObj) {
      setEditingSubjectIndex(null);
      setEditingSubjectText('');
      return;
    }
    const currentSubjects = Array.isArray(classObj.subjects) 
      ? [...classObj.subjects] 
      : ['Physics', 'Chemistry', 'Math', 'Computer Science', 'Biology', 'Urdu'];

    const oldName = currentSubjects[index];
    currentSubjects[index] = trimmed;

    const updatedClass = { ...classObj, subjects: currentSubjects };
    if (typeof onUpdateClass === 'function') {
      onUpdateClass(updatedClass);
    }
    setEditingSubjectIndex(null);
    setEditingSubjectText('');
    setNotification(`Subject renamed from "${oldName}" to "${trimmed}" in Class ${classObj.name}!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteSubjectFromClass = (classObj, subjectToDelete) => {
    if (!classObj) return;
    const currentSubjects = Array.isArray(classObj.subjects) 
      ? [...classObj.subjects] 
      : ['Physics', 'Chemistry', 'Math', 'Computer Science', 'Biology', 'Urdu'];

    const updatedSubjects = currentSubjects.filter(s => s !== subjectToDelete);
    const updatedClass = { ...classObj, subjects: updatedSubjects };

    if (typeof onUpdateClass === 'function') {
      onUpdateClass(updatedClass);
    }
    setNotification(`Subject "${subjectToDelete}" removed from Class ${classObj.name}.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Submit Add Student
  const handleCreateStudent = (e) => {
    e.preventDefault();
    if (!name || !fname || !targetClassId) return;

    const studentNameSaved = name;
    const classObj = data.classes.find(c => c.id === targetClassId);

    const newStudent = {
      id: 'std-' + Date.now(),
      rollNo: rollNo || String(Date.now()).slice(-3),
      name,
      fname,
      fatherNumber: fatherNumber || 'N/A',
      classId: targetClassId
    };

    onAddStudent(newStudent);

    // Reset Form & Close Modal
    setName('');
    setFname('');
    setFatherNumber('');
    setRollNo('');
    setIsAddStudentModalOpen(false);

    setNotification(`Student "${studentNameSaved}" saved successfully in Class ${classObj?.name || ''}!`);
    setTimeout(() => setNotification(null), 5000);
  };

  // Submit Edit Student
  const handleSaveEditStudent = (e) => {
    e.preventDefault();
    if (!editingStudent || !editName || !editFname || !editTargetClassId) return;

    const studentNameSaved = editName;
    const classObj = data.classes.find(c => c.id === editTargetClassId);

    const updatedStudent = {
      ...editingStudent,
      name: editName,
      fname: editFname,
      fatherNumber: editFatherNumber || 'N/A',
      rollNo: editRollNo || editingStudent.rollNo,
      classId: editTargetClassId
    };

    onUpdateStudent(updatedStudent);
    setEditingStudent(null);

    setNotification(`Student "${studentNameSaved}" updated successfully in Class ${classObj?.name || ''}!`);
    setTimeout(() => setNotification(null), 5000);
  };

  // Pagination State (Max 10 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter students based on Class filter and search query
  const filteredStudents = data.students.filter(student => {
    const isClassMatch = filterClassId === 'ALL' || student.classId === filterClassId;
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return isClassMatch;
    const phone = student.fatherNumber || student.parentContact || '';
    const isSearchMatch = 
      (student.name && student.name.toLowerCase().includes(q)) ||
      (student.fname && student.fname.toLowerCase().includes(q)) ||
      String(student.rollNo || '').includes(q) ||
      (phone && phone.includes(q));
    
    return isClassMatch && isSearchMatch;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'classes'
  const [subjectManageClassId, setSubjectManageClassId] = useState('');

  const activeSubjectClass = data.classes.find(c => c.id === (subjectManageClassId || (filterClassId !== 'ALL' ? filterClassId : ''))) || data.classes[0];

  return (
    <div className="space-y-5">
      
      {/* Top Banner & Header */}
      <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student &amp; Class Directory</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <span>Class & Student Directory</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage student enrollments, roll numbers, classes, and subjects curriculum.
          </p>
        </div>

        {/* View Switcher Tabs & Primary Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Students</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 font-mono">
                {data.students.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('classes')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'classes'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Classes & Subjects</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 font-mono">
                {data.classes.length}
              </span>
            </button>
          </div>

          {isAdminLoggedIn && activeTab === 'classes' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsClassModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ Add Class</span>
              </button>
              <button
                type="button"
                onClick={() => setIsManageClassesModalOpen(true)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Manage</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Save/Update Notification Alert Banner */}
      {notification && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-semibold shadow-xs animate-pulse">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* VIEW 1: STUDENTS DIRECTORY */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Class Filter & Search Bar */}
          <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
            {/* Top: Search Bar */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, father name, roll #, or father number..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9.5 pr-8 py-2.5 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Bottom: Class Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1 shrink-0">
                  <Filter className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Class:
                </span>

                <button
                  onClick={() => {
                    setFilterClassId('ALL');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    filterClassId === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  <span>All Classes</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    filterClassId === 'ALL' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {data.students.length}
                  </span>
                </button>

                {data.classes.map(c => {
                  const count = data.students.filter(s => s.classId === c.id).length;
                  const isSelected = filterClassId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setFilterClassId(c.id);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60'
                      }`}
                    >
                      <span>Class {c.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {filterClassId !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => {
                    setSubjectManageClassId(filterClassId);
                    setActiveTab('classes');
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Class {data.classes.find(c => c.id === filterClassId)?.name} Subjects →</span>
                </button>
              )}
            </div>
          </div>

          {/* Student List Table */}
          <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-3 flex-wrap">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  {filterClassId === 'ALL' ? 'All Enrolled Students' : `Class ${data.classes.find(c => c.id === filterClassId)?.name || ''} Students`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {paginatedStudents.length} of {filteredStudents.length} enrolled students
                </p>
              </div>

              {isAdminLoggedIn && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (data.classes.length > 0) {
                        setTargetClassId(filterClassId !== 'ALL' ? filterClassId : data.classes[0].id);
                      }
                      setIsAddStudentModalOpen(true);
                    }}
                    className="text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 flex items-center gap-1.5 cursor-pointer px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95 whitespace-nowrap"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsBatchPrintOpen(true)}
                    className="text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 flex items-center gap-1.5 cursor-pointer px-3.5 py-2 rounded-xl shadow-xs transition-all whitespace-nowrap"
                    title="Print Report Cards for the class"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Batch Print Report Cards</span>
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full text-left text-sm min-w-[620px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                    <th className="py-3 px-4 whitespace-nowrap">Roll #</th>
                    <th className="py-3 px-4 whitespace-nowrap">Student Name</th>
                    <th className="py-3 px-4 whitespace-nowrap">Father Name</th>
                    <th className="py-3 px-4 whitespace-nowrap">Father Number</th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[110px]">Class</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap min-w-[200px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60 text-slate-900 dark:text-slate-200">
                  {paginatedStudents.length > 0 ? (
                    paginatedStudents.map(student => {
                      const studentClassObj = data.classes.find(c => c.id === student.classId);
                      const classNameDisplay = studentClassObj ? studentClassObj.name : 'Unassigned';

                      return (
                        <tr key={student.id} className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-indigo-700 dark:text-indigo-400 font-extrabold whitespace-nowrap">#{student.rollNo}</td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">{student.name}</td>
                          <td className="py-3 px-4 text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">{student.fname || 'N/A'}</td>
                          <td className="py-3 px-4 text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {isAdminLoggedIn ? (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>{student.fatherNumber || student.parentContact || 'N/A'}</span>
                              </div>
                            ) : (
                              <span className="text-slate-500 font-mono text-[11px] italic">🔒 Admin Only</span>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                              Class {classNameDisplay}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              {isAdminLoggedIn ? (
                                <>
                                  {/* Printable Report Card Button (Admin Only) */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedReportStudent(student)}
                                    className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white rounded-xl transition-all cursor-pointer shadow-xs"
                                    title="Generate Monthly Report Card"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>

                                  {/* Student ID Card Button (Admin Only) */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedIdCardStudent(student)}
                                    className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white rounded-xl transition-all cursor-pointer shadow-xs"
                                    title="Print Student ID Card"
                                  >
                                    <Contact className="w-4 h-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(student)}
                                    className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white rounded-xl transition-all cursor-pointer shadow-xs"
                                    title="Edit Student Profile"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onDeleteStudent(student.id);
                                    }}
                                    className="p-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white rounded-xl transition-all cursor-pointer shadow-xs"
                                    title="Delete Student"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                                  🔒 Admin Protected
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50">
                            <Users className="w-6 h-6" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Students Found</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {searchQuery ? 'No students matched your search criteria.' : 'Begin by enrolling your first student into their respective class.'}
                          </p>
                          {isAdminLoggedIn && !searchQuery && (
                            <button
                              onClick={() => {
                                if (data.classes.length > 0 && !targetClassId) {
                                  setTargetClassId(filterClassId !== 'ALL' ? filterClassId : data.classes[0].id);
                                }
                                setIsAddStudentModalOpen(true);
                              }}
                              className="mt-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                            >
                              <UserPlus className="w-4 h-4" /> Enroll First Student
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Pager Controls (Max 10 per page) */}
            {filteredStudents.length > 0 && (
              <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Showing <strong className="text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong className="text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</strong> of <strong className="text-indigo-600 dark:text-indigo-400">{filteredStudents.length}</strong> Students
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      ◀ Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Next ▶
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: CLASS SUBJECTS & SETTINGS */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          {/* Class Selection Pills Bar */}
          <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1 shrink-0">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Select Class:
                </span>
                {data.classes.map(c => {
                  const isSelected = (activeSubjectClass?.id === c.id);
                  const enrolledCount = data.students.filter(s => s.classId === c.id).length;

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSubjectManageClassId(c.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60'
                      }`}
                    >
                      <span>Class {c.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        {(c.subjects || []).length} subs · {enrolledCount} st
                      </span>
                    </button>
                  );
                })}
              </div>

              {isAdminLoggedIn && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsClassModalOpen(true)}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    + Add Class
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsManageClassesModalOpen(true)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    Edit/Delete Classes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Selected Class Subjects Details Card */}
          {activeSubjectClass ? (
            <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    Class {activeSubjectClass.name} Subjects ({activeSubjectClass.subjects?.length || 0})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Customize syllabus subjects for tests, marks ledger, and report cards.
                  </p>
                </div>

                {isAdminLoggedIn && (
                  <form 
                    onSubmit={(e) => handleAddSubjectToClass(e, activeSubjectClass)} 
                    className="flex items-center gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      placeholder="Subject name (e.g. Physics)"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </form>
                )}
              </div>

              {/* Subjects Badges Pills List */}
              <div className="flex flex-wrap gap-2 pt-1 min-h-[44px] items-center">
                {(activeSubjectClass.subjects || []).length > 0 ? (
                  (activeSubjectClass.subjects || []).map((sub, idx) => {
                    const isEditingThis = editingSubjectIndex === `${activeSubjectClass.id}-${idx}`;

                    return (
                      <div key={idx} className="bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 group hover:border-indigo-500/50 transition-all shadow-xs">
                        {isEditingThis ? (
                          <input
                            type="text"
                            defaultValue={sub}
                            autoFocus
                            onBlur={(e) => handleRenameSubject(activeSubjectClass, idx, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameSubject(activeSubjectClass, idx, e.currentTarget.value);
                            }}
                            className="bg-white dark:bg-slate-950 px-2 py-0.5 rounded text-slate-900 dark:text-white text-xs font-bold border border-indigo-500 focus:outline-none w-28"
                          />
                        ) : (
                          <span>{sub}</span>
                        )}

                        {isAdminLoggedIn && (
                          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSubjectIndex(`${activeSubjectClass.id}-${idx}`);
                                setEditingSubjectText(sub);
                              }}
                              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 p-0.5 cursor-pointer"
                              title="Rename Subject"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubjectFromClass(activeSubjectClass, sub)}
                              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 cursor-pointer"
                              title="Delete Subject"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-slate-400 italic py-2">
                    No subjects configured yet for Class {activeSubjectClass.name}. Enter a subject name above to add.
                  </div>
                )}
              </div>

              {isAdminLoggedIn && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 mt-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                    Class <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{activeSubjectClass.name}</strong> Quick Actions:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditClass(activeSubjectClass)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-500" /> Rename Class
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClassWithConfirm(activeSubjectClass)}
                      className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Class
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
              No classes found. Please add a class to get started.
            </div>
          )}
        </div>
      )}

      {/* Printable Report Card Modal (Admin Authenticated Only) */}
      {selectedReportStudent && isAdminLoggedIn && (
        <ReportCardModal
          student={selectedReportStudent}
          month={new Date().toISOString().slice(0, 7)}
          data={data}
          onClose={() => setSelectedReportStudent(null)}
        />
      )}

      {/* Batch Printable Report Cards Modal */}
      {isBatchPrintOpen && isAdminLoggedIn && (
        <BatchReportCardModal
          data={data}
          initialClassId={filterClassId !== 'ALL' ? filterClassId : undefined}
          onClose={() => setIsBatchPrintOpen(false)}
        />
      )}

      {/* Printable Student ID Card Modal (Admin Authenticated Only) */}
      {selectedIdCardStudent && isAdminLoggedIn && (
        <IdCardModal
          student={selectedIdCardStudent}
          data={data}
          isAdminLoggedIn={isAdminLoggedIn}
          onClose={() => setSelectedIdCardStudent(null)}
        />
      )}

      {/* Modal: Manage All Classes (Edit & Delete) */}
      {isManageClassesModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-auto max-h-[85vh] overflow-y-auto relative z-[100000]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Manage & Delete Classes
                </h3>
                <p className="text-xs text-slate-400">Rename or delete any class from your academy database.</p>
              </div>
              <button onClick={() => setIsManageClassesModalOpen(false)} className="text-slate-400 hover:text-white text-base font-bold">✕</button>
            </div>

            <div className="space-y-3 py-2">
              {data.classes.map((cls) => {
                const count = data.students.filter(s => s.classId === cls.id).length;
                return (
                  <div key={cls.id} className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-indigo-500/50 transition-all">
                    <div>
                      <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <span>Class {cls.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-900/60 text-indigo-300 font-semibold border border-indigo-500/30">
                          {count} Student(s)
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{cls.subject || 'No batch description'}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsManageClassesModalOpen(false);
                          handleOpenEditClass(cls);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/30 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteClassWithConfirm(cls)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-rose-600/30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsManageClassesModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Edit Class */}
      {editingClass && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 my-auto max-h-[85vh] overflow-y-auto relative z-[100000]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                Edit Class {editingClass.name}
              </h3>
              <button onClick={() => setEditingClass(null)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveEditClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Class Name (e.g. 9th, 10th, 1st Year)</label>
                <input
                  type="text"
                  required
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Batch Name</label>
                <input
                  type="text"
                  value={editClassSubject}
                  onChange={(e) => setEditClassSubject(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  Save Class Changes
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Add New Class */}
      {isClassModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 my-auto relative z-[100000]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-400" />
                Create New Class
              </h3>
              <button onClick={() => setIsClassModalOpen(false)} className="text-slate-400 hover:text-white text-base font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Class Name (e.g. 9th, 10th, 1st Year)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9th"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Batch Name</label>
                <input
                  type="text"
                  placeholder="e.g. Science Batch"
                  value={newClassSubject}
                  onChange={(e) => setNewClassSubject(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Add New Student */}
      {isAddStudentModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto max-h-[85vh] overflow-y-auto relative z-[100000]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg">Enroll New Student</h3>
              <button onClick={() => setIsAddStudentModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Student Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Father Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Ahmed"
                    value={fname}
                    onChange={(e) => setFname(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Father Mobile Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +92 300 1234567"
                    value={fatherNumber}
                    onChange={(e) => setFatherNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Roll Number</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Class *</label>
                  <select
                    value={targetClassId}
                    onChange={(e) => setTargetClassId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                  >
                    {data.classes.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        Class {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  Save & Enroll Student
                </button>
              </div>

            </form>

          </div>
        </div>,
        document.body
      )}

      {/* Modal: Edit Student */}
      {editingStudent && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto max-h-[85vh] overflow-y-auto relative z-[100000]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg">Edit Student Record</h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Student Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Father Name *</label>
                  <input
                    type="text"
                    required
                    value={editFname}
                    onChange={(e) => setEditFname(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Father Mobile Number</label>
                  <input
                    type="text"
                    value={editFatherNumber}
                    onChange={(e) => setEditFatherNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={editRollNo}
                    onChange={(e) => setEditRollNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Class Assignment *</label>
                  <select
                    value={editTargetClassId}
                    onChange={(e) => setEditTargetClassId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                  >
                    {data.classes.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        Class {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  Save Changes
                </button>
              </div>

            </form>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
