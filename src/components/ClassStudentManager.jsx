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
  Contact
} from 'lucide-react';
import ReportCardModal from './ReportCardModal';
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
    const isSearchMatch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.fname && student.fname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.rollNo && student.rollNo.includes(searchQuery));
    
    return isClassMatch && isSearchMatch;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const selectedClassObj = data.classes.find(c => c.id === filterClassId);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Users className="w-6 h-6 text-indigo-400" />
          Class & Student Management
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage classes, class-wise subjects 📚, student roll numbers, and parent contact information.
        </p>
      </div>

      {/* Dynamic Save/Update Notification Alert Banner */}
      {notification && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 px-5 py-3.5 rounded-2xl flex items-center justify-between text-sm font-semibold shadow-xl shadow-emerald-950/40 animate-pulse">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-xs text-emerald-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Class Filter & Search Bar */}
      <div className="glass-panel rounded-2xl p-4 space-y-3.5 shadow-lg">
        
        {/* Top: Full-Width Sleek Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search student by name, father name, or roll # (e.g. 101, Ali)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9.5 pr-8 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner transition-all"
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

        {/* Bottom: Class Filter Badges & Admin Actions in 1 Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
          
          {/* Class Filter Badges */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Filter:
            </span>

            <button
              onClick={() => {
                setFilterClassId('ALL');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                filterClassId === 'ALL'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60'
              }`}
            >
              <span>All Classes</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                filterClassId === 'ALL' ? 'bg-indigo-950/60 text-indigo-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
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
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  <span>Class {c.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isSelected ? 'bg-indigo-950/60 text-indigo-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Admin Class Management Actions */}
          {isAdminLoggedIn && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsClassModalOpen(true)}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                <FolderPlus className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                + Add Class
              </button>

              <button
                onClick={() => setIsManageClassesModalOpen(true)}
                className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                ⚙️ Edit / Delete Classes
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Class Subjects Manager Section */}
      <div className="glass-panel rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Class Subjects Management {selectedClassObj ? `(Class ${selectedClassObj.name})` : '(Select a class to add/edit subjects)'}
            </h3>
            <p className="text-xs text-slate-400">
              Customize subjects for each class. (e.g. 9th has Pak Studies, 10th has Quran Pak, First Year has Computer Science).
            </p>
          </div>

          {isAdminLoggedIn && selectedClassObj && (
            <form 
              onSubmit={(e) => handleAddSubjectToClass(e, selectedClassObj)} 
              className="flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder="New Subject Name (e.g. English)"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
              />
              <button
                type="submit"
                onClick={(e) => handleAddSubjectToClass(e, selectedClassObj)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Subject
              </button>
            </form>
          )}
        </div>

        {/* Render Subject Chips */}
        {selectedClassObj ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {(Array.isArray(selectedClassObj.subjects) ? selectedClassObj.subjects : ['Physics', 'Chemistry', 'Math', 'Computer Science', 'Biology', 'Urdu']).map((sub, idx) => {
                const isEditingThis = editingSubjectIndex === `${selectedClassObj.id}-${idx}`;

                return (
                  <div key={idx} className="bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-2 group hover:border-indigo-500/50 transition-all">
                    {isEditingThis ? (
                      <input
                        type="text"
                        defaultValue={sub}
                        autoFocus
                        onBlur={(e) => handleRenameSubject(selectedClassObj, idx, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubject(selectedClassObj, idx, e.currentTarget.value);
                        }}
                        className="bg-slate-950 px-2 py-0.5 rounded text-white text-xs font-bold border border-indigo-500 focus:outline-none w-28"
                      />
                    ) : (
                      <span>{sub}</span>
                    )}

                    {isAdminLoggedIn && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSubjectIndex(`${selectedClassObj.id}-${idx}`);
                            setEditingSubjectText(sub);
                          }}
                          className="text-slate-400 hover:text-indigo-300 p-0.5"
                          title="Rename Subject"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubjectFromClass(selectedClassObj, sub)}
                          className="text-slate-500 hover:text-rose-400 p-0.5"
                          title="Delete Subject"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedClassObj && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 mt-2">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                  <span>Class <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">{selectedClassObj.name}</strong> Settings:</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditClass(selectedClassObj)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Class Name
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClassWithConfirm(selectedClassObj)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Class {selectedClassObj.name}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-xs text-slate-400 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            💡 Select any specific Class filter above (e.g. <strong className="text-indigo-400">Class 9th</strong> or <strong className="text-indigo-400">Class 10th</strong>) to add, rename or delete subjects for that class!
          </div>
        )}
      </div>

      {/* Student List Table */}
      <div className="glass-panel glow-accent-indigo rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              {filterClassId === 'ALL' ? 'All Students List' : `Class ${data.classes.find(c => c.id === filterClassId)?.name || ''} Student List`}
            </h3>
            <p className="text-xs text-slate-400">Showing {filteredStudents.length} student record(s)</p>
          </div>

          {isAdminLoggedIn && (
            <button
              onClick={() => {
                if (data.classes.length > 0 && !targetClassId) {
                  setTargetClassId(filterClassId !== 'ALL' ? filterClassId : data.classes[0].id);
                }
                setIsAddStudentModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              + Add New Student
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold tracking-wider">
                <th className="py-3.5 px-4 whitespace-nowrap">Roll #</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Student Name</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Father Name (FNAME)</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Father Number</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[110px]">Class</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[210px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map(student => {
                  const studentClassObj = data.classes.find(c => c.id === student.classId);
                  const classNameDisplay = studentClassObj ? studentClassObj.name : 'Unassigned';

                  return (
                    <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-indigo-400 font-bold whitespace-nowrap">#{student.rollNo}</td>
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">{student.name}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-300 font-medium whitespace-nowrap">{student.fname || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-300 whitespace-nowrap">
                        {isAdminLoggedIn ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{student.fatherNumber || 'N/A'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px] italic">🔒 Admin Only</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 whitespace-nowrap shadow-sm">
                          Class {classNameDisplay}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isAdminLoggedIn ? (
                          <div className="flex items-center justify-center gap-2">
                            {/* Student ID Card Button (Admin Only) */}
                            <button
                              onClick={() => setSelectedIdCardStudent(student)}
                              className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/50 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer"
                              title="Generate Student Identity Card"
                            >
                              <Contact className="w-3.5 h-3.5" /> ID Card
                            </button>

                            {/* Report Card Button (Admin Only) */}
                            <button
                              onClick={() => setSelectedReportStudent(student)}
                              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all whitespace-nowrap cursor-pointer"
                              title="Print Student Monthly Progress Report Card"
                            >
                              <Printer className="w-3.5 h-3.5" /> Report
                            </button>

                            <button
                              onClick={() => handleOpenEdit(student)}
                              className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-all cursor-pointer"
                              title="Edit Student"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                onDeleteStudent(student.id);
                                setNotification(`Student "${student.name}" deleted.`);
                                setTimeout(() => setNotification(null), 4000);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px] italic">🔒 Admin Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 font-medium">
                    No student records matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Pager Controls (Max 10 per page) */}
        {filteredStudents.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 font-medium">
              Showing <strong className="text-white">{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong className="text-white">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</strong> of <strong className="text-indigo-400">{filteredStudents.length}</strong> Students
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  ◀ Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Next ▶
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Printable Report Card Modal */}
      {selectedReportStudent && (
        <ReportCardModal
          student={selectedReportStudent}
          month={new Date().toISOString().slice(0, 7)}
          data={data}
          onClose={() => setSelectedReportStudent(null)}
        />
      )}

      {/* Printable Student ID Card Modal */}
      {selectedIdCardStudent && (
        <IdCardModal
          student={selectedIdCardStudent}
          data={data}
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Father Name (FNAME) *</label>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Father Name (FNAME) *</label>
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
