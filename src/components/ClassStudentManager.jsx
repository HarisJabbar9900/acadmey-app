import React, { useState } from 'react';
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
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); // student object when editing
  
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  // Subject Management States
  const [newSubjectName, setNewSubjectName] = useState('');
  const [editingSubjectIndex, setEditingSubjectIndex] = useState(null);
  const [editingSubjectText, setEditingSubjectText] = useState('');

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
    if (!className) return;

    const newClass = {
      id: 'cls-' + Date.now(),
      name: className,
      subject: subjectName || `${className} Batch`,
      subjects: ['Physics', 'Chemistry', 'Math', 'Computer Science', 'English', 'Urdu']
    };

    onAddClass(newClass);
    setClassName('');
    setSubjectName('');
    setIsClassModalOpen(false);
    setNotification(`New Class "${className}" added successfully!`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Subject Handlers
  const handleAddSubjectToClass = (e, classObj) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const existingSubjects = classObj.subjects || ['Physics', 'Chemistry', 'Math', 'Computer Science', 'English', 'Urdu'];
    if (existingSubjects.includes(newSubjectName.trim())) {
      setNotification(`Subject "${newSubjectName.trim()}" already exists in Class ${classObj.name}!`);
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const updatedSubjects = [...existingSubjects, newSubjectName.trim()];
    const updatedClass = { ...classObj, subjects: updatedSubjects };

    if (onUpdateClass) {
      onUpdateClass(updatedClass);
    }
    setNewSubjectName('');
    setNotification(`Subject "${newSubjectName.trim()}" added to Class ${classObj.name}!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRenameSubject = (classObj, index, newName) => {
    if (!newName.trim()) {
      setEditingSubjectIndex(null);
      return;
    }
    const existingSubjects = [...(classObj.subjects || [])];
    const oldName = existingSubjects[index];
    existingSubjects[index] = newName.trim();

    const updatedClass = { ...classObj, subjects: existingSubjects };
    if (onUpdateClass) {
      onUpdateClass(updatedClass);
    }
    setEditingSubjectIndex(null);
    setEditingSubjectText('');
    setNotification(`Subject renamed from "${oldName}" to "${newName.trim()}" in Class ${classObj.name}!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteSubjectFromClass = (classObj, subjectToDelete) => {
    const existingSubjects = classObj.subjects || [];
    const updatedSubjects = existingSubjects.filter(s => s !== subjectToDelete);
    const updatedClass = { ...classObj, subjects: updatedSubjects };

    if (onUpdateClass) {
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            Class & Student Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage classes, class-wise subjects 📚, student roll numbers, and parent contact information.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isAdminLoggedIn ? (
            <>
              <button
                onClick={() => setIsClassModalOpen(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <FolderPlus className="w-4 h-4 text-purple-400" />
                + Add Class
              </button>

              <button
                onClick={() => {
                  if (data.classes.length > 0 && !targetClassId) {
                    setTargetClassId(data.classes[0].id);
                  }
                  setIsAddStudentModalOpen(true);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                + Add New Student
              </button>
            </>
          ) : (
            <div className="px-3.5 py-2 bg-slate-800/80 border border-slate-700 text-slate-400 rounded-xl text-xs font-medium flex items-center gap-2">
              <span>👁️ View-Only Mode</span>
              <span className="text-[10px] text-slate-500">(Admin PIN required to edit/add)</span>
            </div>
          )}
        </div>
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

      {/* Class Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Class Filter Badges / Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-indigo-400" /> Filter Class:
          </span>

          <button
            onClick={() => setFilterClassId('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterClassId === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Classes ({data.students.length})
          </button>

          {data.classes.map(c => {
            const count = data.students.filter(s => s.classId === c.id).length;
            const isSelected = filterClassId === c.id;
            return (
              <div key={c.id} className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setFilterClassId(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>Class {c.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {count}
                  </span>
                </button>

                {isAdminLoggedIn && (
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditClass(c);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg text-xs transition-colors"
                      title={`Edit Class ${c.name}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClassWithConfirm(c);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg text-xs transition-colors"
                      title={`Delete Class ${c.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search student, father or roll #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none w-full"
          />
        </div>

      </div>

      {/* Class Subjects Manager Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
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
            <form onSubmit={(e) => handleAddSubjectToClass(e, selectedClassObj)} className="flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder="New Subject Name (e.g. Bio-Tech)"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 shadow-md shadow-indigo-600/30"
              >
                <Plus className="w-3.5 h-3.5" /> Add Subject
              </button>
            </form>
          )}
        </div>

        {/* Render Subject Chips */}
        {selectedClassObj ? (
          <div className="flex flex-wrap items-center gap-2">
            {(selectedClassObj.subjects || ['Physics', 'Chemistry', 'Math', 'Computer Science', 'English', 'Urdu']).map((sub, idx) => {
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
        ) : (
          <div className="text-xs text-slate-400 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            💡 Select any specific Class filter above (e.g. <strong className="text-indigo-400">Class 9th</strong> or <strong className="text-indigo-400">Class 10th</strong>) to add, rename or delete subjects for that class!
          </div>
        )}
      </div>

      {/* Student List Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              {filterClassId === 'ALL' ? 'All Students List' : `Class ${data.classes.find(c => c.id === filterClassId)?.name || ''} Student List`}
            </h3>
            <p className="text-xs text-slate-400">Showing {filteredStudents.length} student record(s)</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold tracking-wider">
                <th className="py-3.5 px-4">Roll #</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Father Name (FNAME)</th>
                <th className="py-3.5 px-4">Father Number</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map(student => {
                  const studentClassObj = data.classes.find(c => c.id === student.classId);
                  const classNameDisplay = studentClassObj ? studentClassObj.name : 'Unassigned';

                  return (
                    <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-indigo-400 font-bold">#{student.rollNo}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{student.name}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-300 font-medium">{student.fname || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-300">
                        {isAdminLoggedIn ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{student.fatherNumber || 'N/A'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px] italic">🔒 Admin Only</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-indigo-300 border border-slate-700">
                          Class {classNameDisplay}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isAdminLoggedIn ? (
                          <div className="flex items-center justify-center gap-2">
                            {/* Student ID Card Button (Admin Only) */}
                            <button
                              onClick={() => setSelectedIdCardStudent(student)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                              title="Generate Student Identity Card"
                            >
                              <Contact className="w-3.5 h-3.5" /> ID Card
                            </button>

                            {/* Report Card Button (Admin Only) */}
                            <button
                              onClick={() => setSelectedReportStudent(student)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                              title="Print Student Monthly Progress Report Card"
                            >
                              <Printer className="w-3.5 h-3.5" /> Report
                            </button>

                            <button
                              onClick={() => handleOpenEdit(student)}
                              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
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
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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

      {/* Modal: Edit Class */}
      {editingClass && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 my-auto max-h-[85vh] overflow-y-auto">
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
        </div>
      )}

      {/* Modal: Add New Class */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 my-auto max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg">Create New Class</h3>
              <button onClick={() => setIsClassModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Class Name (e.g. 9th, 10th)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9th"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Batch Name</label>
                <input
                  type="text"
                  placeholder="e.g. Science Batch"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
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
        </div>
      )}

      {/* Modal: Add New Student */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto max-h-[85vh] overflow-y-auto">
            
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
        </div>
      )}

      {/* Modal: Edit Student */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto max-h-[85vh] overflow-y-auto">
            
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
        </div>
      )}

    </div>
  );
}
