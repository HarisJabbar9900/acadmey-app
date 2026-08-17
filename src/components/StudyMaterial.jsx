import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Download,
  PlusCircle,
  Upload,
  Trash2,
  Edit3,
  Search,
  Filter,
  CheckCircle2,
  Book,
  HelpCircle,
  Eye,
  Sparkles,
  FileCheck
} from 'lucide-react';

export default function StudyMaterial({ data, selectedClassId, isAdminLoggedIn, onAddResource, onUpdateResource, onDeleteResource }) {
  const [activeClassFilter, setActiveClassFilter] = useState(selectedClassId || 'ALL');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [notification, setNotification] = useState(null);

  // Form State - Add Resource
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Book'); // 'Book' | 'Notes' | 'MCQs'
  const [targetClassId, setTargetClassId] = useState(data.classes[0]?.id || '');
  const [subject, setSubject] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');

  // Form State - Edit Resource
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Book');
  const [editTargetClassId, setEditTargetClassId] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editFileUrl, setEditFileUrl] = useState('');
  const [editFileName, setEditFileName] = useState('');

  const handleOpenEdit = (res) => {
    setEditingResource(res);
    setEditTitle(res.title || '');
    setEditCategory(res.category || 'Book');
    setEditTargetClassId(res.classId || data.classes[0]?.id || '');
    setEditSubject(res.subject || '');
    setEditFileUrl(res.fileUrl || '');
    setEditFileName(res.fileName || '');
  };

  const [fileError, setFileError] = useState('');

  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    setFileError('');
    if (file) {
      if (file.size > 3 * 1024 * 1024) { // 3MB limit for inline base64
        setFileError('File size is larger than 3MB. For large PDF books, please paste a Google Drive link below.');
      }

      if (isEdit) {
        setEditFileName(file.name);
      } else {
        setFileName(file.name);
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (isEdit) {
          setEditFileUrl(event.target.result);
        } else {
          setFileUrl(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateResource = (e) => {
    e.preventDefault();
    if (!title || !category || !targetClassId) return;

    const classObj = data.classes.find(c => c.id === targetClassId);

    const newResource = {
      id: 'res-' + Date.now(),
      title,
      category,
      classId: targetClassId,
      subject: subject || 'General',
      fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
      fileUrl: fileUrl || '',
      date: new Date().toISOString().split('T')[0]
    };

    onAddResource(newResource);
    setIsModalOpen(false);

    // Reset Form
    setTitle('');
    setCategory('Book');
    setSubject('');
    setFileUrl('');
    setFileName('');

    setNotification(`"${newResource.title}" uploaded successfully for Class ${classObj?.name || ''}!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveEditResource = (e) => {
    e.preventDefault();
    if (!editingResource || !editTitle || !editCategory || !editTargetClassId) return;

    const classObj = data.classes.find(c => c.id === editTargetClassId);

    const updatedResource = {
      ...editingResource,
      title: editTitle,
      category: editCategory,
      classId: editTargetClassId,
      subject: editSubject || 'General',
      fileName: editFileName || editingResource.fileName,
      fileUrl: editFileUrl || editingResource.fileUrl
    };

    onUpdateResource(updatedResource);
    setEditingResource(null);

    setNotification(`"${updatedResource.title}" updated successfully!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDelete = (resourceId, resourceTitle) => {
    onDeleteResource(resourceId);
    setNotification(`"${resourceTitle}" deleted.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter resources
  const resources = data.resources || [];
  const filteredResources = resources.filter(res => {
    const isClassMatch = activeClassFilter === 'ALL' || res.classId === activeClassFilter;
    const isCategoryMatch = activeCategoryFilter === 'ALL' || res.category === activeCategoryFilter;
    const isSearchMatch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.subject && res.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (res.fileName && res.fileName.toLowerCase().includes(searchQuery.toLowerCase()));

    return isClassMatch && isCategoryMatch && isSearchMatch;
  });

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'Book':
        return { label: '📘 Book', bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
      case 'Notes':
        return { label: '📝 Notes', bg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' };
      case 'MCQs':
        return { label: '❓ MCQs', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
      default:
        return { label: '📄 PDF Resource', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Class-Wise Digital Library
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Study Material & PDF Downloads
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Download Class Textbooks 📘, Chapter Notes 📝, and Solved MCQs ❓ directly on your device.
          </p>
        </div>

        {/* Action Button for Admin */}
        <div>
          {isAdminLoggedIn ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload PDF Resource
            </button>
          ) : (
            <div className="px-3.5 py-2 bg-slate-800/80 border border-slate-700 text-slate-400 rounded-xl text-xs font-medium flex items-center gap-2">
              <span>👁️ Student View</span>
              <span className="text-[10px] text-slate-500">(Admin PIN required to upload or edit PDF books)</span>
            </div>
          )}
        </div>
      </div>

      {/* Notification Alert */}
      {notification && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 px-5 py-3.5 rounded-2xl flex items-center justify-between text-sm font-semibold shadow-xl shadow-emerald-950/40 animate-pulse">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filters & Search Control Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-semibold text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-400" /> Material Type:
            </span>
            {[
              { id: 'ALL', label: 'All Resources' },
              { id: 'Book', label: '📘 Books' },
              { id: 'Notes', label: '📝 Notes' },
              { id: 'MCQs', label: '❓ MCQs' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeCategoryFilter === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search books, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

        </div>

        {/* Class Selection Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Select Class:</span>
          <button
            onClick={() => setActiveClassFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeClassFilter === 'ALL'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
          >
            All Classes
          </button>
          {data.classes.map(c => {
            const isSelected = activeClassFilter === c.id;
            const count = resources.filter(r => r.classId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setActiveClassFilter(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
              >
                <span>Class {c.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map(res => {
            const classObj = data.classes.find(c => c.id === res.classId);
            const badge = getCategoryBadge(res.category);

            return (
              <div
                key={res.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between group hover:shadow-indigo-500/10"
              >
                <div>
                  {/* Category & Class Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      Class {classObj?.name || 'All'}
                    </span>
                  </div>

                  {/* Resource Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                    {res.title}
                  </h3>

                  {/* Metadata */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> {res.subject || 'General'}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">{res.date}</span>
                  </div>
                </div>

                {/* Download & Admin Actions Footer */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {res.fileUrl ? (
                      <a
                        href={res.fileUrl}
                        download={res.fileName || 'document.pdf'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" /> Download PDF
                      </a>
                    ) : (
                      <button
                        onClick={() => alert(`Document "${res.title}" is ready for download!`)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" /> Download PDF
                      </button>
                    )}
                  </div>

                  {/* Admin Edit & Delete Actions */}
                  {isAdminLoggedIn && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(res)}
                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-colors"
                        title="Edit PDF Resource"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(res.id, res.title)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                        title="Delete PDF Resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-white font-bold text-base mb-1">No PDF Resources Found</h4>
          <p className="text-xs text-slate-400">
            No study material matches your selected class or filter. {isAdminLoggedIn ? 'Click "Upload PDF Resource" to add books or notes.' : ''}
          </p>
        </div>
      )}

      {/* Modal: Upload PDF Resource */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-auto max-h-[85vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-lg">Upload PDF Study Material</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-4">

              {/* Material Type Selection */}
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1">Resource Category / Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Book', label: '📘 Book' },
                    { id: 'Notes', label: '📝 Notes' },
                    { id: 'MCQs', label: '❓ MCQs' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${category === cat.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resource Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 9th Computer Science Complete Book"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Class & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Class *</label>
                  <select
                    value={targetClassId}
                    onChange={(e) => setTargetClassId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                  >
                    {data.classes.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        Class {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Physics, Computer..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* PDF Document Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select PDF File from Device</label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileChange(e, false)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white cursor-pointer"
                />
                {fileError && (
                  <p className="text-[11px] text-amber-400 mt-1 font-medium bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    ⚠️ {fileError}
                  </p>
                )}
                {fileName && !fileError && (
                  <p className="text-[11px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" /> Selected: {fileName}
                  </p>
                )}
              </div>

              {/* PDF Link Backup */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">OR Google Drive / Web PDF Link</label>
                <input
                  type="url"
                  placeholder="https://example.com/book.pdf"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Footer Modal Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" /> Save & Publish Resource
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit PDF Resource */}
      {editingResource && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-auto max-h-[85vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-lg">Edit PDF Resource</h3>
              </div>
              <button onClick={() => setEditingResource(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEditResource} className="space-y-4">

              {/* Material Type Selection */}
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1">Resource Category / Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Book', label: '📘 Book' },
                    { id: 'Notes', label: '📝 Notes' },
                    { id: 'MCQs', label: '❓ MCQs' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setEditCategory(cat.id)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${editCategory === cat.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resource Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Class & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Class *</label>
                  <select
                    value={editTargetClassId}
                    onChange={(e) => setEditTargetClassId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                  >
                    {data.classes.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        Class {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Replace PDF Document */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Replace PDF File (Optional)</label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileChange(e, true)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white cursor-pointer"
                />
                {editFileName && (
                  <p className="text-[11px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" /> File: {editFileName}
                  </p>
                )}
              </div>

              {/* PDF Link Backup */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Google Drive / Web PDF Link</label>
                <input
                  type="url"
                  placeholder="https://example.com/book.pdf"
                  value={editFileUrl}
                  onChange={(e) => setEditFileUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Footer Modal Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
